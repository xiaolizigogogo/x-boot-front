<template>
    <div style="width:100%;height:100%;" id="user_flow"></div>
</template>

<script>
import echarts from 'echarts';

const option = {
    tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
        {
            name: '入流量',
            type: 'gauge',
            min: 0,
            max: 1000,
            detail: {
                formatter: '{value}',
                fontSize: 18,
                offsetCenter: [0, '50px'],
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                  color: 'auto',
                  fontSize : 30
                }
            },
            data: [{value: 50, name: '调用次数'}],
            center: ['50%', '50%'],
            radius: '120%',
            startAngle: 200,
            endAngle : -20,
            title: {
                offsetCenter: [0, '80px']
            },
            axisLine: {
                lineStyle: {
                    color: [[0.2, '#ff4500'],[0.4, 'skyblue'],[0.8, 'orange'],[1, '#lightgreen']],  // color: [],
                    width: 20
                }
            },
          splitLine: {           // 分隔线
            show: true,        // 默认显示，属性show控制显示与否
            length :30,         // 属性length控制线长
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
              color: '#eee',
              width: 2,
              type: 'solid'
            }
          },
          pointer : {
            length : '80%',
            width : 8,
            color : 'auto'
          },
          axisTick: {            // 坐标轴小标记
            show: true,        // 属性show控制显示与否，默认不显示
            splitNumber: 5,    // 每份split细分多少段
            length :8,         // 属性length控制线长
            lineStyle: {       // 属性lineStyle控制线条样式
              color: '#eee',
              width: 1,
              type: 'solid'
            }
          },
          axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
            show: true,
            formatter: function(v){
              switch (v+''){
                case '100': return '弱';
                case '300': return '低';
                case '600': return '中';
                case '900': return '高';
                default: return '';
              }
            },
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
              color: '#333'
            }
          },
        }
    ]
};

export default {
    name: 'userFlow',
    mounted () {
        let userFlow = echarts.init(document.getElementById('user_flow'));
        option.series[0].data[0].value = (Math.random() * 1000).toFixed(2) - 0;
        userFlow.setOption(option);
       localStorage.setItem("flowBase64",userFlow.getDataURL());
        window.addEventListener('resize', function () {
            userFlow.resize();
        });
    }
};
</script>
