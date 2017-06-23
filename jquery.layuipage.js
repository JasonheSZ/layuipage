/*
 * ajax分页 基于jQuery、layui
 * autor: jasonhe
 * Date: 2017-04-17
 * Revision:1.1
 * Example: 
     $(document).ready(function() {
	    $('#bigDiv').layuipage({
		    ajaxUrl: 'http://localhost/cwphotos/test.json',  //请求的数据地址
		    dataParams: {'commentId':'123456789'},  //请求数据参数，选填
		    pageSize: 2, //每页大小，选填
		    sendType: 'GET', //ajax请求方式POST，选填
		    pageObj: $('#page'), //分页组件对象，选填
		    'callback': function(data, obj){}, //数据查询成功回调函数，选填
		    data: data //数据列表，如果有，优先使用而不请求ajaxUrl
	    });
    });
 */
(function($){  
	
	//默认配置
	var defaults = {
		ajaxUrl: '',
		pageNo: 1,
		pageSize: 10,
		pageObj: null,
		sendType: 'GET',
		dataParams: null,
		data: null, //数据列表，如果有，优先使用
		callback: function(data, obj){}
	};
	
	var index; //加载层
		
	/**
	 * 获取模板
	 */
	function getTemplate(target){
		var tbodystr = $(target).children('tbody').html();
		
		if($(target).data('temp') == null){
			//table的栏数
			var thCount = $(target).find('th').size();
			var strTemp = '{{#  layui.each(d, function(index, item){ }}'
			strTemp += tbodystr;
			strTemp += '{{#  }); }}  {{#  if(null === d || d.length === 0){ }}  <tr class="no-data"><td colspan="'+thCount+'"><img src="../static/images/empty.png" /><p>暂无数据...</p></td> </tr>  {{#  } }} ';
			$(target).data('temp', strTemp);
			return strTemp
		}else{
			return $(target).data('temp');
		}
	}
	
	/**
	 * 渲染数据列表模版
	 */
	function rederTemplate(target, data){
		layui.use('laytpl', function(){
			var laytpl = layui.laytpl;
			var getTpl = getTemplate(target);
			
			laytpl(getTpl).render(data, function(html){
			  $(target).children('tbody').html(html);
			});
		});
	}
	
	/**
	 * 分页组件
	 */
	function buildPage(target, data, pages){
		var state = $.data(target, 'layuipage');
		var opts = state.options;
		
		  //调用分页
		  layui.use('laypage', function(){
			  var laypage = layui.laypage;
			  laypage({
				cont: opts.pageObj //分页对象
				,pages: pages //得到总页数
				,curr: opts.pageNo
				,jump: function(obj, first){
					if(!first){
						//得到了当前页，用于向服务端请求对应数据
						var curr = obj.curr;
						opts.dataParams = $.extend(true, opts.dataParams, {"page": curr});
						
						layui.use('layer', function(){
							var layer = layui.layer;
							
							$.ajax({
							   type: opts.sendType,
							   url: opts.ajaxUrl,
							   data: opts.dataParams,
							   success: function(data){
								   rederTemplate(target, data.list);
								   
									opts.callback(data.list, target);
									layer.close(index); 
							   },
							   beforeSend: function (xhr) {
								   //显示加载中
								   index = layer.load();
							   },
						  	   error: function(XMLHttpRequest, textStatus, errorThrown){
						  		   layer.close(index);
						  		   layer.msg('数据加载错误，请重试');
							   },
							   dataType: 'json'
							});
						});
						
						//保存当前页码
						var newOpt = $.extend(true, {}, state.options, {'pageNo': curr});			
						$.data(target, 'layuipage', {
							options: newOpt
						});
					}
				}
			});
		});
	}
	
	function dataPage(target){
		var state = $.data(target, 'layuipage');
		var opts = state.options;
		
		//提交数据带上分页参数
		$.extend(opts.dataParams, {'page': opts.pageNo, 'rows': opts.pageSize});		
		
		layui.use('layer', function(){
			var layer = layui.layer;
			
			//异步获取数据
			if(!opts.data){
				$.ajax({
				   type: opts.sendType,
				   url: opts.ajaxUrl,
				   data: opts.dataParams,
				   success: function(data){
					   if(data.pageNum > data.lastPage && data.lastPage > 0){
						   var newOpt = $.extend(true, {}, state.options, {'pageNo': data.lastPage});			
							$.data(target, 'layuipage', {
								options: newOpt
							});
							dataPage(target);
					   }else{
						   rederTemplate(target, data.list);					   

						   $(target).find('tbody').show();
						   
						   buildPage(target, data.list, data.pages);
						   opts.callback(data.list, target);
		
							layer.close(index); 
					   }
				   },
				   beforeSend: function (xhr) {
					   //显示加载中
					   index = layer.load();
				   },
			  	   error: function(XMLHttpRequest, textStatus, errorThrown){
			  		   layer.close(index);
			  		   layer.msg('数据加载错误，请重试');
				   },
				   dataType: 'json'
				});
			}else{
				//直接从参数data中获取数据
				$(target).find('tbody').show();
				rederTemplate(target, opts.data);
				if(opts.pageObj!=null){
				   buildPage(target, opts.data);
			    }
				opts.callback(opts.data, target);
			}
		});
	}
	
	$.fn.layuipage = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.layuipage.methods[options];
			if (method){
				return method(this, param);
			}
		}

		options = options || {};
		return this.each(function(){
			$(this).find('tbody').hide();
			
			var state = $.data(this, 'layuipage');
			if(!state) state = {options: defaults};			
			
			var newOpt = $.extend(true, {}, state.options, options);			
			$.data(this, 'layuipage', {
				options: newOpt
			});
			
			dataPage(this);
		});
	};
	
	//方法区
	$.fn.layuipage.methods = {
		//刷新数据
		reload: function(jq){
			return jq.each(function(){
				dataPage(this);
			});
		},
		//重新加载，带参数
		load: function(jq, param){
			return jq.each(function(){
				var state = $.data(this, 'layuipage');
				$.data(this, 'layuipage', {
					options: $.extend({}, state.options, param)
				});
				dataPage(this);
			});
		}
	}
})(jQuery);