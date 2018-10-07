<style lang="less">
    @import '../../../styles/common.less';
    @import '../advanced-router.less';
</style>

<template>
    <div>
      <Row>
        <Card>
          <p slot="title">
            <Icon type="compose"></Icon>
            订单信息
          </p>
          <Table :columns="order_info" :data="order_info_data"></Table>
        </Card>
      </Row>
      <Row>
        <Card>
          <p slot="title">
            <Icon type="compose"></Icon>
            答案
          </p>
          <Table :columns="card_info" :data="card_info_data"></Table>
        </Card>
      </Row>
    </div>
</template>

<script>
import texteditor from "../../my-components/text-editor/text-editor"
import Button from "iview/src/components/button/button";

export default {
    name: 'shopping-info',
  components:{
    Button,
    texteditor

  },
    data () {
        return {
            showInfo: false,
            id:0,
          orderInfo:'',
          order_info: [
            {
              title: '订单类型',
              key: 'type',
              align: 'center'
            },
            {
              title: '男生姓名',
              key: 'name1',
              align: 'center'
            },
            {
              title: '男生生日',
              key: 'day1',
              align: 'center'
            },
            {
              title: '女生姓名',
              key: 'name2',
              align: 'center'
            },
            {
              title: '女生生日',
              key: 'day2',
              align: 'center'
            }

          ],
          card_info: [
            {
              title: '答案',
              key: 'url',
              align: 'center',
              width:1000,
              height:2000,
              render: (h, params) => {
              return h('div', {
                attrs: {
                  style: 'width: 800px;height: 2000px;'
                },
              }, [
                h('img', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  attrs: {
                    src: params.row.url, style: 'width: 800px;height: 2000px;border-radius: 2px;'
                  },
                  style: {
                  },
                }),
              ]);
    }
            },
      { title: "操作",
        key: "action",
        align: "center",
        width: 500,
        render:(h,params) => {
        return ('div',[
          h(
            "Button",
            {
              props: {
                type: "primary",
                size: "small"
              },
              on: {
                click: () => {
                this.save();
      }
      }
      },
        "生成答案"
      )])
      }}
          ],
            shopping_col: [
                {
                    title: '购买物品名称',
                    key: 'goodsName',
                    align: 'center'
                },
                {
                    title: '购买数量',
                    key: 'number',
                    align: 'center'
                },
                {
                    title: '价格',
                    key: 'retailPrice',
                    align: 'center'
                }
            ],
            shopping_data: [],
            order_info_data:[],
            card_info_data:[]
        };
    },
    methods: {
        init () {
          const orderId=this.$route.query.orderId;
          this.id=orderId;
          var orderInfo=JSON.parse(localStorage.getItem('orderInfo'));
          console.log(orderInfo)
          this.order_info_data = [orderInfo];
          this.card_info_data=[orderInfo];
          this.orderInfo=orderInfo;
          // localStorage.setItem('editorContent',orderInfo.editorContent==null?"  ":orderInfo.editorContent)
        },
      save(){
        // var editorContent=localStorage.getItem('editorContent');
        // this.orderInfo.editorContent=editorContent;
        var url='https://chenxima.yodemon.top/peidui.htm?name1='+this.orderInfo.name1+'&name2='+this.orderInfo.name2+'&orderId='+this.id
        window.open(url)
      }
    },
    mounted () {
        this.init();
    },
    watch: {
        '$route' () {
            this.init();
        }
    }
};
</script>
