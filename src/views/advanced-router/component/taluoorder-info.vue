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
            塔罗牌
          </p>
          <Table :columns="card_info" :data="card_info_data"></Table>
        </Card>
      </Row>
        <Row>
            <Card>
                <p slot="title">
                    <Icon type="compose"></Icon>
                    订单详情
                </p>
                <texteditor id="aaaa"></texteditor>
            </Card>
        </Row>
    </div>
</template>

<script>
import texteditor from "../../my-components/text-editor/text-editor"

export default {
    name: 'shopping-info',
  components:{
    texteditor

  },
    data () {
        return {
            showInfo: false,
          order_info: [
            {
              title: '订单类型',
              key: 'type',
              align: 'center'
            },
            {
              title: '性别',
              key: 'sex',
              align: 'center'
            },
            {
              title: '星座',
              key: 'xingzuo',
              align: 'center'
            },
            {
              title: '问题',
              key: 'question',
              align: 'center'
            },
            {
              title: '问题详情',
              key: 'questionDetail',
              align: 'center'
            }

          ],
          card_info: [
            {
              title: '牌名',
              key: 'name',
              align: 'center'
            },
            {
              title: '正意',
              key: 'faceMean',
              align: 'center'
            },
            {
              title: '反意',
              key: 'backMean',
              align: 'center'
            },
            {
              title: '图片',
              key: 'url',
              align: 'center',
              width:200,
              height:200,
              render: (h, params) => {
              return h('div', {
                attrs: {
                  style: 'width: 80px;height: 80px;'
                },
              }, [
                h('img', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  attrs: {
                    src: params.row.url, style: 'width: 80px;height: 80px;border-radius: 2px;'
                  },
                  style: {
                  },
                }),
              ]);
    }
            }
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
          var orderInfo =JSON.parse(localStorage.getItem('orderInfo'));
          console.log(orderInfo)
          this.order_info_data = [orderInfo];
          this.card_info_data=orderInfo.cardList;
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
