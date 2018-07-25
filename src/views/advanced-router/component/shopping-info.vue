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
            物流信息
          </p>
          <Table :columns="express_info" :data="express_info_data"></Table>
        </Card>
      </Row>
        <Row>
            <Card>
                <p slot="title">
                    <Icon type="compose"></Icon>
                    订单详情
                </p>
                <Table :columns="shopping_col" :data="shopping_data"></Table>
            </Card>
        </Row>
    </div>
</template>

<script>
export default {
    name: 'shopping-info',
    data () {
        return {
            showInfo: false,
          order_info: [
            {
              title: '订单金额',
              key: 'actualPrice',
              align: 'center'
            },
            {
              title: '优惠金额',
              key: 'couponPrice',
              align: 'center'
            },
            {
              title: '收货地址',
              key: 'address',
              align: 'center'
            },
            {
              title: '收货人手机号',
              key: 'addTime',
              align: 'center'
            }

          ],
          express_info: [
            {
              title: '物流公司',
              key: 'name',
              align: 'center'
            },
            {
              title: '快递单号',
              key: 'time',
              align: 'center'
            },
            {
              title: '价格',
              key: 'price',
              align: 'center'
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
            express_info_data:[]
        };
    },
    methods: {
        init () {
          const orderId=this.$route.query.orderId;
          this.getRequest("/orders", {id:orderId,current:1,size:10}).then(res => {
            this.loading = false;
            if (res.status == 200) {
              this.order_info_data = res.data.records;
            }
          });
          this.getRequest("/orders/orderGoods", {orderId:orderId}).then(res => {
            this.loading = false;
            if (res.status == 200) {
              this.shopping_data = res.data;
            }
          });
          this.getRequest("/orders/orderExpress", {orderId:orderId}).then(res => {
            this.loading = false;
            if (res.status == 200) {
              this.express_info_data = res.data.records;
            }
          });
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
