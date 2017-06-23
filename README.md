# layuipage
 基于layui的分页jQuery插件
## 使用示例
表格：
```html
<table class="layui-table" id="tb_list" lay-even lay-skin="nob">
				  <colgroup>
				    <col width="*">
				    <col width="10%">
				    <col width="20%">
				  </colgroup>
				  <thead>
				    <tr>
				      <th>客户名称</th>
				      <th>终端名称</th>
				      <th>操作</th>
				    </tr> 
				  </thead>
				  <tbody>
				  	<tr>
				      <td>
						 {{ item.userName }}
						</td>
				      <td>{{ item.appName }}</td>
				      <td>
				      	<a href="#" class="act vView" data-id="{{ item.id }}">查看</a>
				      	<a href="javascript:void(0)" class="act vEdit" data-id="{{ item.id }}">编辑</a>
				      </td>
				    </tr>
				  </tbody>
				</table>
```
分页控件
```html
<div id="page" class="page"></div>
```
```javascript
<script type="text/javascript">
   $('#tb_list').layuipage({
				    ajaxUrl: '${ctx}/queryList',
				    pageObj: 'page'
			});	;
</script>

```
