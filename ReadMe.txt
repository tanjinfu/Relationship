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
2. Change the way that calculate coordinates and draw descendants diagram(calculate tree width first instead of the coordinates directly).
3. (optional) Add an unbound function to get the ancestors of a person. Currently, they are got by odata url, but the url cann't be too long, only 4 levels are allowed.

2014-10-29 Wednesday
ɾ�� git submodule ��git ����ģ�飩

����������ᴴ�� git submodule ��git ��ģ�飩
���Է�ʽ��ӣ�ʹ�� git submodule �������git����Ϊ��Ŀ¼��ӣ�����ģ��
���Է�ʽ��ӣ�ʹ�� git add ��ӣ����ĳ����Ŀ¼������һ�� git �⣬���Զ����Ϊ��ģ�飬���ٵݹ���Ӹ�Ŀ¼������ļ�
��ô�����ַ�ʽ��ӵ���ģ����ʲô��ͬ����ģ����ʲô�����ã����ɾ��ģ���أ�
���ַ�ʽ���ģ�飬Ч�����в�ͬ
���Է�ʽ��ӣ�����ֱ�ӽ�Ŀ¼����汾�⣬��ʵ�����Ǽ���һ����Ŀ¼��ͬ���� submodule ��Ŀ��
���Է�ʽ��ӣ����������Է�ʽ�� index/commit �д���submodule ��Ŀ�⣬���ᴴ��һ�� .gitmodules �ļ���Ҳ���� .git/config �д�����Ӧ��¼������μ� git submodule ���
��ģ��ĸ�����
��ʱ����δ��ʶ��Ŀ¼����ģ�鷽ʽ��ӡ��������� gistore �����ļ���Ŀ¼ʱ����ĳ��Ŀ¼������ git ���˰汾���ƣ��ͻ�����ģ��ķ�ʽ���Ŀ¼�� ��ν���ģ�鰴��������Ŀ¼��ʽ��ӵ��汾����ϵͳ�أ�������ķ�����������
ɾ����ģ��� .git Ŀ¼��������ģ���µ� git �汾��ɾ��
��ִ�� git add ʱ���� fatal: Path '... ...' is in submodule '...'
��ô������ô���أ�
���ɾ����ģ��
ʹ�� git �����ɾ����ģ��
git rm --cached path/to/submodule