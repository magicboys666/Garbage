# 智能垃圾分类小程序
## 小程序使用到的云开发内容
> 不了解小程序云开发请访问[文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

云函数，云数据库：
- 数据库：存储垃圾分类的相关垃圾数据， 创建表commit，sort，product，answer，answer-history，exchange，mini_member，mini_sign_detail，user，wrong，goods。分别把db文件下的commit.json，sort.json，product.json，answer.json，answer-history.json，exchange.json，mini_member.json，mini_sign_detail.json，user.json，wrong.json和goods.json导入云数据库即可。

- 云函数：获取百度识别库的accessToken
[百度AI识别库地址](http://ai.baidu.com/docs#/ImageClassify-API/ebc492b1)
修改云函数baiduAccessToken中的apiKey和secretKey

## 需要修改为自己的key 
1. 小程序key在文件project.config.json->appid 记住创建小程序的时候选择云开发
2. 百度key 主要做拍照识别的cloudfunctions->baiduAccessToken->index->apiKey和secretKey
此处替换为：API Key 和 Secret Key
3.修改app.js中的env（开发环境），本人的例如magic-7g6favc279535843



## 常见错误
1. 没有自己部署云函数
2. 数据库没有给与相应的权限，最好给最大权限
3. 需要的key配置错误
4. 没有创建数据库名称

## 最常见错误
![错误](https://6c61-laji-bopv4-1259505195.tcb.qcloud.la/11111111111.png?sign=27ab0e0c9ea4f776c7da31155148feb8&t=1582555839
)
![解决办法](https://6c61-laji-bopv4-1259505195.tcb.qcloud.la/2222222.png?sign=f40dcc35a1057378883bf0fb99c17c16&t=1582556012)


 


