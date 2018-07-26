<template>
  <div>
    <div class="demo-upload-list" v-for="(item,index) in uploadList" :key="index">
      <template v-if="item.status == 'finished'">
        <img :src="item.url">
        <div class="demo-upload-list-cover">
          <Icon type="ios-eye-outline" @click.native="handleView(item.name)"></Icon>
          <Icon type="ios-trash-outline" @click.native="handleRemove(index)"></Icon>
        </div>
      </template>
      <template v-else>
        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
      </template>
    </div>
    <Upload
      :show-upload-list="false"
      :default-file-list="defaultList"
      :on-success="handleSuccess"
      :format="['jpg','jpeg','png']"
      :max-size="maxSize"
      :on-format-error="handleFormatError"
      :on-exceeded-size="handleMaxSize"
      :before-upload="handleBeforeUpload"
      :multiple="!multiple"
      type="drag"
      :data="uptoken"
      :action="actionUrl"
      :style="{'display': 'inline-block','width':width}">
      <div :style="{'width': width,'height':height,'line-height': '58px'}" v-if="multiple&&uploadList.length==0">
        <Icon type="camera" size="20"></Icon>
      </div>
    </Upload>
    <Modal title="图片预览" v-model="visible">
      <img :src="imgName" v-if="visible" style="width: 100%">
    </Modal>
  </div>
</template>
<script>
  import {qiniuConfig} from '../../../utils/global';//七牛配置
  const QiniuUPToken = require('qiniu-uptoken');//引入前端生成七牛token的包

  export default {
    name: 'qiniu',
    props:{
      maxSize:{
        type:Number,
        default:2048
      },
      multiple:{
        type:Boolean,
        default:true
      },
      width:{
        default:"58px"
      },
      height:{
        default:'58px'
      },
      imgUrl:{
        type:String
      }
    },
    data() {
      return {
        imgName: "",
        picHostName:qiniuConfig.pic_hostname,
        visible: false,
        uptoken:{},
        actionUrl:qiniuConfig.action_url,
        fileList:[],
        uploadList:[],
        defaultList:[]
      };
    },
    methods: {
      getToken(){
        this.uptoken.token = QiniuUPToken(qiniuConfig.access_key,qiniuConfig.secret_key,qiniuConfig.bucketname);
      },
      handleView(name) {
        this.imgName = name;
        this.visible = true;
      },
      handleRemove(file) {
        this.fileList.splice(file,1);
        this.defaultList.splice(file,1);
        this.uploadList.splice(file,1);
      },
      handleSuccess(res, file) {
        file.url = res.result;
        file.name = res.result;
        this.defaultList.push(file)
        this.fileList.push(file)
        this.uploadList.push(file)
        // this.imgUrl=file.url
        this.$emit('handleSuccess', res.result);//传递给父组件
      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: "上传的格式不正确",
          desc:
          "文件'" +
          file.name +
          "'不合法, 请重新选择jpg or png.的格式"
        });
      },
      handleMaxSize(file) {
        this.$Notice.warning({
          title: "文件大小超出限制",
          desc: "文件'" + file.name + "'大小超出"+this.maxSize/1024+'M限制'
        });
      },
      handleBeforeUpload() {
        const check = this.uploadList.length < 5;
        if (!check) {
          this.$Notice.warning({
            title: "最多只能上传五张图片"
          });
        }
        return check;
      }
    },
    mounted() {
      this.getToken();
      this.uploadList = this.fileList;
    },
    watch: {
      imgUrl: function (var1, oldVar) {
        console.log(var1)
        this.fileList = [];
        this.defaultList = []
        this.uploadList = []
        if (var1 != undefined) {
          this.fileList.push({url: var1, status: "finished", name: var1})
          this.defaultList.push({url: var1, status: "finished", name: var1})
          this.uploadList.push({url: var1, status: "finished", name: var1})
        }
      }
    }
  };
</script>
<style>
  .demo-upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    margin-right: 4px;
  }
  .demo-upload-list img {
    width: 100%;
    height: 100%;
  }
  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
  }
  .demo-upload-list:hover .demo-upload-list-cover {
    display: block;
  }
  .demo-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
