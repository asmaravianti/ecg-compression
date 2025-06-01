# 🏆 真实Codabench集成指南

## 📋 **当前状态诊断**

### ❌ **问题分析**
根据提交状态 `scored-locally`，您的平台目前：
- ✅ 成功接收文件上传
- ✅ 用户认证和管理正常
- ❌ **Codabench API连接失败**
- ❌ 使用模拟评分代替真实benchmark

### 🎯 **您的目标**
> "公开平台 + 算法上传 + 私有数据集评估 + benchmark比较"

这需要**真实的Codabench后端集成**，而不是当前的模拟系统。

## 🔧 **真实集成实施方案**

### 1. **验证Codabench竞赛配置**

**竞赛地址**: https://www.codabench.org/competitions/5899/

首先需要确认：
```bash
# 检查竞赛状态
curl "https://www.codabench.org/api/competitions/5899/"

# 检查提交阶段
curl "https://www.codabench.org/api/competitions/5899/phases/"
```

### 2. **配置真实API连接**

创建 `.env` 文件：
```env
# Codabench配置
CODABENCH_API_URL=https://www.codabench.org/api
CODABENCH_COMPETITION_ID=5899
CODABENCH_USERNAME=你的用户名
CODABENCH_PASSWORD=你的密码
CODABENCH_SECRET_KEY=竞赛密钥

# 服务器配置
JWT_SECRET=your-jwt-secret
PORT=3000
```

### 3. **修复API连接代码**

**问题**: 当前代码在Codabench连接失败时回退到模拟评分

**解决方案**: 修改提交逻辑，确保真实连接

```javascript
// 修复后的提交端点
app.post('/api/submit-to-codabench', authenticateToken, upload.single('file'), async (req, res) => {
    console.log('🚀 Processing real Codabench submission...');

    try {
        // 1. 验证竞赛状态
        const competitionStatus = await checkCompetitionStatus();
        if (!competitionStatus.acceptingSubmissions) {
            throw new Error('Competition not accepting submissions');
        }

        // 2. 获取认证令牌
        const authToken = await getCodabenchAuth();
        if (!authToken) {
            throw new Error('Failed to authenticate with Codabench');
        }

        // 3. 真实提交到Codabench
        const submissionResult = await submitToCodeabench(req.file, req.body, authToken);

        // 4. 返回真实提交ID（不是模拟）
        res.json({
            success: true,
            submissionId: submissionResult.id,
            status: 'submitted-to-codabench',
            message: 'Submitted to real ECG benchmark system',
            codabenchUrl: `https://www.codabench.org/competitions/5899/submissions/${submissionResult.id}/`
        });

    } catch (error) {
        console.error('❌ Real submission failed:', error);
        // 不再回退到模拟，而是返回真实错误
        res.status(500).json({
            success: false,
            error: 'Real benchmark submission failed',
            details: error.message,
            suggestion: 'Check Codabench permissions and competition status'
        });
    }
});
```

### 4. **实时评分结果获取**

```javascript
// 获取真实评分结果
async function getRealSubmissionResults(submissionId) {
    const authToken = await getCodabenchAuth();

    const response = await fetch(
        `https://www.codabench.org/api/submissions/${submissionId}/`,
        {
            headers: { 'Authorization': `Token ${authToken}` }
        }
    );

    const data = await response.json();

    return {
        status: data.status, // 'Submitted', 'Running', 'Finished'
        scores: data.scores, // 真实的CR, PRD, QS分数
        leaderboard_entry: data.leaderboard_entry
    };
}
```

### 5. **真实排行榜集成**

```javascript
// 获取真实排行榜
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const authToken = await getCodabenchAuth();

        // 获取竞赛阶段
        const phases = await getCompetitionPhases();
        const activePhase = phases.find(p => p.status === 'Current') || phases[0];

        // 获取真实排行榜
        const leaderboardResponse = await fetch(
            `https://www.codabench.org/api/competitions/5899/phases/${activePhase.id}/leaderboard/`,
            {
                headers: { 'Authorization': `Token ${authToken}` }
            }
        );

        const realLeaderboard = await leaderboardResponse.json();

        res.json({
            success: true,
            results: realLeaderboard.results,
            isReal: true,
            message: 'Real benchmark leaderboard',
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to get real leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Could not fetch real leaderboard',
            suggestion: 'Check Codabench API permissions'
        });
    }
});
```

## 🛠️ **实施步骤**

### 步骤1: 验证Codabench访问权限
```bash
# 测试API连接
node -e "
const axios = require('axios');
axios.get('https://www.codabench.org/api/competitions/5899/')
  .then(r => console.log('✅ Competition accessible:', r.data.title))
  .catch(e => console.log('❌ Access denied:', e.message));
"
```

### 步骤2: 配置认证
- 确保您在Codabench上的账户有竞赛访问权限
- 获取正确的API密钥和凭据
- 测试认证流程

### 步骤3: 部署修改
- 替换模拟评分代码
- 实施真实API调用
- 添加错误处理和重试机制

### 步骤4: 测试验证
- 上传测试算法
- 验证真实评分
- 确认排行榜同步

## 🎯 **预期效果**

实施后，您的平台将：

1. **真实benchmark**: 算法在私有ECG数据集上评估
2. **公开比较**: 与其他团队的真实结果比较
3. **实时更新**: 排行榜反映Codabench真实状态
4. **透明度**: 用户可以看到Codabench提交链接

## ⚠️ **注意事项**

1. **权限要求**: 需要Codabench竞赛管理员权限
2. **API限制**: 可能有提交频率限制
3. **数据安全**: 确保私有数据集安全
4. **错误处理**: 优雅处理API失败

## 🚀 **下一步行动**

1. **立即**: 检查您的Codabench竞赛权限
2. **配置**: 设置正确的API凭据
3. **测试**: 验证API连接
4. **部署**: 替换模拟代码为真实集成

**您的想法完全正确！现在需要的是将概念转化为真实的Codabench集成。**