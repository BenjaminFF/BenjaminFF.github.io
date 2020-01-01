---
title: githubPages部署spa
description: GitHub Pages原生不支持单页面应用。当这里有一个带有前端路由的新页面加载的时候(例如example.tld/foo)，因为/foo是前端路由，而GitHubPages服务器会把/foo作为后端路由来处理，因为在服务器找不到/foo这个路由所对应的文件，GitHubP......
tags: ["blog", "spa","github"]
categories: ["JavaScript","Github Page"]
date: '2019-12-30'
---


## 思路
参考 https://github.com/rafrex/spa-github-pages

GitHub Pages原生不支持单页面应用。当这里有一个带有前端路由的新页面加载的时候(例如example.tld/foo)，因为/foo是前端路由，而GitHubPages服务器会把/foo作为后端路由来处理，因为在服务器找不到/foo这个路由所对应的文件，GitHubPages服务器将返回404。

处理方案是：<br>
当GitHubPages服务器收到一个带有前端路由的请求时(例如example.tld/foo)，它会返回一个404页面。可以自定义404页面，在这个404页面里，写一个script，拿到当前的url地址，将该url地址后面的path转换成一个query string或是hash路由（反正只有方便后面还原之前的path和让服务器忽略转换后的path即可）。例如可以把example.tld/one/two?a=b&c=d#qwe转换成example.tld/?p=/one/two&q=a=b~and~c=d#qwe。

当GitHubPages服务器收到重定向的地址请求后，会忽略query string和hash fragment并返回index.html。这时在加载spa之前，处理传过来的url，将其还原成之前的url，并将其添加到浏览器的history中，并让其url不加载(window.history.replaceState()可以实现)。

这样当spa加载后，就回去解析浏览器的history的路由了。

将问题分解，有以下要点：<br>
1.解析当前url，将其转化为新的url。<br>
2.将新的url还原成当前的url，加入到history中，并使浏览器不加载当前url。<br>

## window.location
window.location对象可以用来得到当前的url和重定向。其中有属性：
- window.location.herf返回整个url。
- window.location.hostname返回url的域名
- window.location.pathname返回url的路径和文件名

例如`https://www.w3schools.com/js/tryit.asp?filename=tryjs_loc_href`的herf是`https://www.w3schools.com/js/tryit.asp?filename=tryjs_loc_href`，pathname是`/js/tryit.asp`，hostname是`www.w3schools.com`。

Location对象的assign()和replace()的区别：<br>
- window.location.assign(url) ： 加载 URL 指定的新的 HTML 文档。 就相当于一个链接，跳转到指定的url，当前页面会转为新页面内容，可以点击后退返回上一个页面。
- window.location.replace(url) ： 通过加载 URL 指定的文档来替换当前文档 ，这个方法是替换当前窗口页面，前后两个页面共用一个
窗口，所以是没有后退返回上一页的。
- window.location.assign(url) 相当于window.location.href="url"。


## window.history
window.history是一个只读属性，用来获取History 对象的引用，History 对象提供了操作浏览器会话历史（浏览器地址栏中访问的页面，以及当前页面中通过框架加载的页面）的接口。

使用 back(), forward()和 go() 方法来完成在用户历史记录中向后和向前的跳转。

HTML5引入了 history.pushState() 和 history.replaceState() 方法，它们分别可以**添加和修改**历史记录条目。这些方法通常与window.onpopstate配合使用。
