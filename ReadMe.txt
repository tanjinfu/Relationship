The js tree is http://www.ztree.me/v3/
https://github.com/zTree/zTree_v3

reference the demo.


Cordova: build cross platform mobile apps.
knockout turtorial:
http://www.cnblogs.com/TomXu/archive/2011/11/21/2257154.html

http://api.jqueryui.com/dialog/


 Asp.net Identity:
 http://www.cnblogs.com/jesse2013/p/3583308.html
 http://www.cnblogs.com/jesse2013/p/aspnet-identity-claims-based-authentication-and-owin.html

 TODO:
1. Add validation to 
	edit person dialog box

2014-10-29 Wednesday
删除 git submodule （git 库子模组）

有两种情况会创建 git submodule （git 子模组）
显性方式添加：使用 git submodule 命令将其他git库作为子目录添加，即子模组
隐性方式添加：使用 git add 添加，如果某个子目录本身是一个 git 库，就自动添加为子模组，不再递归添加该目录下面的文件
那么这两种方式添加的子模组有什么不同？子模组有什么副作用？如何删除模组呢？
两种方式添加模组，效果略有不同
隐性方式添加，看似直接将目录加入版本库，而实际上是加入一个和目录名同名的 submodule 条目；
显性方式添加，除了像隐性方式在 index/commit 中创建submodule 条目外，还会创建一个 .gitmodules 文件，也会在 .git/config 中创建相应记录。具体参见 git submodule 命令。
子模组的副作用
有时，并未意识到目录按照模组方式添加。例如在用 gistore 备份文件和目录时，当某个目录本身用 git 做了版本控制，就会以子模组的方式添加目录。 如何将子模组按照正常的目录形式添加到版本控制系统呢？用下面的方法做不到：
删除子模组的 .git 目录，即将子模组下的 git 版本库删除
当执行 git add 时报错： fatal: Path '... ...' is in submodule '...'
那么，该怎么办呢？
如何删除子模组
使用 git 命令即可删除子模组
git rm --cached path/to/submodule

2015-02-07 

Error	10	The command ""D:\git\github\tanjinfu\Relationship\.nuget\NuGet.exe" install "D:\git\github\tanjinfu\Relationship\Relationship\packages.config" -source ""  -NonInteractive -RequireConsent -solutionDir "D:\git\github\tanjinfu\Relationship\ "" exited with code 9020.	Relationship
