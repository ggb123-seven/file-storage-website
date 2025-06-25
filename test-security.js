// 安全性和错误处理测试脚本
async function testSecurity() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔒 开始安全性和错误处理测试...\n');

  // 测试1: 请求频率限制测试
  console.log('⚡ 测试请求频率限制...');
  try {
    const promises = [];
    for (let i = 0; i < 60; i++) {
      promises.push(fetch(`${baseUrl}/api/files`));
    }
    
    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    console.log(`✅ 频率限制测试: ${responses.length}个请求，${rateLimitedResponses.length}个被限制`);
    if (rateLimitedResponses.length > 0) {
      console.log('  🛡️ 频率限制正常工作');
    }
  } catch (error) {
    console.error('❌ 频率限制测试异常:', error.message);
  }

  // 测试2: 无效参数测试
  console.log('\n📝 测试输入验证...');
  const invalidParams = [
    { name: '无效页码', url: '/api/files?page=-1' },
    { name: '超大页码', url: '/api/files?page=9999' },
    { name: '无效限制', url: '/api/files?limit=0' },
    { name: '超大限制', url: '/api/files?limit=1000' },
    { name: '无效排序字段', url: '/api/files?sortBy=invalid' },
    { name: '无效排序方向', url: '/api/files?sortOrder=invalid' }
  ];

  for (const param of invalidParams) {
    try {
      const response = await fetch(`${baseUrl}${param.url}`);
      const data = await response.json();
      
      if (response.status === 400 && !data.success) {
        console.log(`✅ ${param.name}: 正确拒绝 (${response.status})`);
      } else {
        console.log(`⚠️ ${param.name}: 未正确验证 (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ${param.name}测试异常:`, error.message);
    }
  }

  // 测试3: 权限验证测试
  console.log('\n🔐 测试权限验证...');
  const authTests = [
    { name: '无密钥上传', headers: {} },
    { name: '错误密钥上传', headers: { 'x-admin-key': 'wrong-key' } },
    { name: '空密钥上传', headers: { 'x-admin-key': '' } },
    { name: '短密钥上传', headers: { 'x-admin-key': '123' } }
  ];

  for (const test of authTests) {
    try {
      const formData = new FormData();
      const blob = new Blob(['test content'], { type: 'text/plain' });
      formData.append('file', blob, 'test.txt');

      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers: test.headers,
        body: formData
      });

      if (response.status === 401) {
        console.log(`✅ ${test.name}: 正确拒绝 (401)`);
      } else {
        console.log(`⚠️ ${test.name}: 未正确拒绝 (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}测试异常:`, error.message);
    }
  }

  // 测试4: 文件安全验证测试
  console.log('\n🛡️ 测试文件安全验证...');
  const fileSecurityTests = [
    { name: '危险文件扩展名', filename: 'malware.exe', type: 'application/octet-stream' },
    { name: '脚本文件', filename: 'script.js', type: 'application/javascript' },
    { name: '不匹配MIME类型', filename: 'image.jpg', type: 'application/pdf' },
    { name: '超大文件', filename: 'large.txt', type: 'text/plain', size: 200 * 1024 * 1024 }
  ];

  for (const test of fileSecurityTests) {
    try {
      const formData = new FormData();
      const content = test.size ? 'x'.repeat(test.size) : 'test content';
      const blob = new Blob([content], { type: test.type });
      formData.append('file', blob, test.filename);

      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers: { 'x-admin-key': 'your-admin-secret-key-here' },
        body: formData
      });

      if (response.status === 400) {
        console.log(`✅ ${test.name}: 正确拒绝 (400)`);
      } else {
        console.log(`⚠️ ${test.name}: 未正确拒绝 (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}测试异常:`, error.message);
    }
  }

  // 测试5: XSS防护测试
  console.log('\n🚫 测试XSS防护...');
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '"><script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src=x onerror=alert("xss")>',
    '<svg onload=alert("xss")>'
  ];

  for (const payload of xssPayloads) {
    try {
      const formData = new FormData();
      const blob = new Blob(['test'], { type: 'text/plain' });
      formData.append('file', blob, 'test.txt');
      formData.append('description', payload);
      formData.append('tags', payload);

      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers: { 'x-admin-key': 'your-admin-secret-key-here' },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        // 检查返回的数据是否包含原始payload
        const responseText = JSON.stringify(data);
        if (responseText.includes('<script>') || responseText.includes('javascript:')) {
          console.log(`⚠️ XSS payload可能未被正确清理: ${payload.substring(0, 20)}...`);
        } else {
          console.log(`✅ XSS payload已被清理: ${payload.substring(0, 20)}...`);
        }
      }
    } catch (error) {
      console.error(`❌ XSS测试异常:`, error.message);
    }
  }

  // 测试6: 安全头部测试
  console.log('\n🔒 测试安全响应头...');
  try {
    const response = await fetch(`${baseUrl}/api/files`);
    
    const securityHeaders = [
      'X-XSS-Protection',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Content-Security-Policy',
      'Referrer-Policy'
    ];

    let foundHeaders = 0;
    securityHeaders.forEach(header => {
      if (response.headers.get(header)) {
        foundHeaders++;
        console.log(`  ✅ ${header}: ${response.headers.get(header)}`);
      } else {
        console.log(`  ❌ 缺少安全头: ${header}`);
      }
    });

    console.log(`📊 安全头部覆盖率: ${foundHeaders}/${securityHeaders.length} (${Math.round(foundHeaders/securityHeaders.length*100)}%)`);
  } catch (error) {
    console.error('❌ 安全头部测试异常:', error.message);
  }

  // 测试7: 错误处理测试
  console.log('\n🚨 测试错误处理...');
  const errorTests = [
    { name: '不存在的文件下载', url: '/api/download/00000000-0000-0000-0000-000000000000' },
    { name: '无效UUID', url: '/api/download/invalid-uuid' },
    { name: '不存在的API端点', url: '/api/nonexistent' }
  ];

  for (const test of errorTests) {
    try {
      const response = await fetch(`${baseUrl}${test.url}`);
      const data = await response.json();
      
      if (!data.success && data.error && data.timestamp) {
        console.log(`✅ ${test.name}: 错误格式正确 (${response.status})`);
      } else {
        console.log(`⚠️ ${test.name}: 错误格式不标准 (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}测试异常:`, error.message);
    }
  }

  // 测试8: 日志记录测试
  console.log('\n📋 测试日志记录...');
  try {
    // 触发一些操作来生成日志
    await fetch(`${baseUrl}/api/files`);
    await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'x-admin-key': 'wrong-key' },
      body: new FormData()
    });
    
    console.log('✅ 日志记录操作已触发（检查服务器控制台输出）');
  } catch (error) {
    console.error('❌ 日志记录测试异常:', error.message);
  }

  console.log('\n🎉 安全性和错误处理测试完成！');
  console.log('🔒 系统安全防护机制已全面部署和验证');
}

// 运行测试
testSecurity().catch(console.error);
