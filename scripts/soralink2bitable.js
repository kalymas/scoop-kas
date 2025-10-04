// surge文档：https://manual.nssurge.com/scripting/common.html
// 
// Surge HTTP Request 脚本 - 提取 Sora 视频链接并发送到飞书 webhook
// 
// 配置方法：在 Surge 配置文件的 [Script] 部分添加：
// sora-webhook = type=http-request,pattern=^https?://videos\.openai\.com/,requires-body=0,script-path=js/soralink2bitable.js,debug=1
//
// 说明：此脚本会拦截所有 videos.openai.com 的请求，提取视频链接并发送到飞书webhook
// 重要：需要在 MITM 的 hostname 中包含 *.openai.com，并确保不在 hostname-disabled 中

console.log("=== Sora 视频链接提取脚本启动 ===");

// Webhook 配置
const WEBHOOK_URL = "https://lcna31whnwdp.feishu.cn/base/workflow/webhook/event/JnjVamIU0wnxEkht0BQcGLLDnfc";

// 获取请求URL
const requestUrl = $request.url;
console.log("捕获到请求URL:", requestUrl);

// 检查是否是 Sora 视频链接
if (requestUrl && requestUrl.includes("videos.openai.com")) {
    console.log("✓ 检测到 Sora 视频链接");
    
    // 提取视频名称（从URL中提取task_id作为名称）
    let videoName = "Sora视频";
    const taskIdMatch = requestUrl.match(/task_([a-z0-9]+)/);
    if (taskIdMatch) {
        videoName = taskIdMatch[0];
        console.log("提取到 Task ID:", videoName);
    }
    
    // 构造webhook请求体（按照飞书webhook格式）
    const webhookData = {
        name: videoName,
        url: requestUrl
    };
    
    console.log("准备发送数据:", JSON.stringify(webhookData, null, 2));
    
    // 发送到webhook（异步，不阻塞响应）
    $httpClient.post({
        url: WEBHOOK_URL,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(webhookData)
    }, function(error, response, data) {
        if (error) {
            console.log("✗ 发送到webhook失败:", error);
        } else {
            console.log("✓ 发送到webhook成功");
            console.log("响应状态码:", response.status);
            if (data) {
                console.log("响应数据:", data);
            }
        }
    });
    
    console.log("→ 已触发异步webhook发送");
} else {
    console.log("→ 非 Sora 视频链接，跳过处理");
}

console.log("=== 脚本执行完成 ===");

// 保持原始响应不变，让视频正常加载
$done({});
