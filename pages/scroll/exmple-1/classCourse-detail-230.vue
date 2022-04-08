<template>
  <view class="classCourseDetail">
    <scroll-view scroll-y="true" class="scrollHeight" @scroll="pageScroll">
      <!-- 头部背景 -->
      <view class="classCourseDetail_img">
        <image :src="handlePic(classInfo.imgUrl)" mode="aspectFill" v-if="classInfo.imgUrl"></image>
        <view class="mask"></view>
      </view>
      <!-- 返回列表的icon区域 -->
      <view class="showSection" :style="{'top': systemHeader+'rpx'}">
        <image :src="returnI" mode="aspectFill" class="smallIcon" @click="returnCCList"></image>
      </view>
      <view class="classCourseDetail_wrap">
        <u-sticky>
          <!-- 滑动时定位的导航 -->
          <nav-bar :border="false" :fixed="false" :statusBar="true" :backgroundColor="'#FFFFFF'" :back="true"
                   v-if="showFixedNavBar">
            <view class="titleWrap">
              <view class="titleWrap_title" :class="classInfo.labelTxt?'w510':'w648'">{{ classInfo.className }}</view>
              <text class="openCalss_label" v-if="classInfo.labelTxt">{{ classInfo.labelTxt }}</text>
            </view>
          </nav-bar>
          <!-- 章节、活动tab -->
          <view class="classCourseTab">
            <view class="classCourseTab_item_wrap">
              <view class="classCourseTab_item" :class="{active: curTab===item.value}"
                    v-for="item in classCourseTabList" :key="item.value" @click="changeTab(item.value)">
                {{ item.name }}
              </view>
            </view>
          </view>
          <view v-show="showFixedNavBar">
            <uni-collapse>
              <uni-collapse-item v-for="(item, index) in chapterList.slice(curIndex,1+curIndex)" :key="item.sort"
                                 :title="item.name"
                                 :open="item.flag"
                                 class="chapterCard_wrap" title-border="none" :border="false">
                <template v-slot:title>
                  <view
                      :class="`chapterCard_header ${index!==0 && ($android ? 'border-bottom border-bottom-android' :'border-bottom')}`">
                    <view class="chapterName">{{ `第${Arabia_To_SimplifiedChinese(index + 1)}章 ${item.name}` }}</view>
                  </view>
                </template>
              </uni-collapse-item>
            </uni-collapse>
          </view>
        </u-sticky>
        <!-- 章节列表、活动列表组件 -->
        <view @touchstart="touchStart" @touchend="touchEnd" :style="{'min-height': minH + 'px'}">
          <chaptersList ref="chapters" :chapterList="chapterList" :classId="classId" :courseId="courseId"
                        :activeFlag="activeFlag" v-if="curTab==='chapter'"></chaptersList>
          <activitiesList :activityList="activityList" :classId="classId" :courseId="courseId"
                          v-if="curTab==='activity'"></activitiesList>
        </view>
      </view>
    </scroll-view>

    <mLoading v-show='loading'></mLoading>
    <uni-popup ref="sheetPopup" type="bottom" @touchmove.stop="">
      <activityStatus @changeStatus="receptActStatus"></activityStatus>
    </uni-popup>
    <gok-popup ref='gokPopup' type="single" :content="'班课已关闭，请与班课管理员联系'" :okText="'我知道了'" @ok="close"/>
  </view>
</template>

<script>
import {
  Component,
  Prop,
  Vue
} from 'vue-property-decorator';
import chaptersList from '$common/class/chapters-list-230.nvue';
import activitiesList from '$common/class/activities-list-230.nvue';
import activityStatus from '$common/class/activity-status.nvue';
import filterIcon from '$image/class/filter.png';
import TAC from '@/api/TAC.API.js';
import {
  GET
} from '@/annotation/http.annotation';
import NavBar from "@/components/uni-nav-bar/uni-nav-bar";
import systemHelper from '@/support/systemHelper';
import returnI from '$image/class/returnCC.png';
import GokPopup from '@/components/popup/index';
import mLoading from '@/components/m-loading/m-loading.vue';
import {
  Arabia_To_SimplifiedChinese
} from '@/common/utils.js';

@Component({
  components: {
    chaptersList,
    activitiesList,
    activityStatus,
    NavBar,
    GokPopup,
    mLoading
  },
  computed: {
    handlePic() {
      return (val) => {
        if (val.indexOf('https') === -1) { // 返回默认图片
          return this.defaultIcon;
        } else {
          return val;
        }
      };
    }
  },
  mounted() {
    this.systemHeader = systemHelper.px2Rpx(systemHelper.getStatusBarHeight() * 2);
    setTimeout(() => {
      const _this = this;
      uni.getSystemInfo({
        success(res) {
          _this.minH = res.windowHeight - _this.systemHeader - 89 - 49 - 16 - 130;
        }
      });
    }, 500);
  }
})
export default class classCourseDetail extends Vue {
  defaultIcon = 'https://oss.goktech.cn/static/img/public/bg-logo-default.png';
  classCourseTabList = [{
    name: '章节',
    value: 'chapter'
  },
    {
      name: '活动',
      value: 'activity'
    }
  ];
  curTab = 'chapter';
  filterIcon = filterIcon;
  currentActState = '全部';
  courseId = ''; // 课程id
  classId = ''; // 班课id
  classInfo = {}; // 头部信息
  chapterList = []; // 章节列表
  activityList = []; // 活动列表
  status = 3; // 进行中 -> 1， 已结束 -> 2 ，全部(进行中与已结束活动)-> 3
  returnI = returnI;
  showFixedNavBar = false;
  systemHeader = 0; // 手机刘海高度
  activeFlag = 1; // 班课是否结束标识，0 结束 1 启用，已结束不埋点
  enterFlag = 1; // 是否允许进入班课 0 不允许 1 允许
  loading = false;
  touchStartX = 0; // 触屏起始点x
  touchStartY = 0; // 触屏起始点y
  minH = 0;
  curIndex = 1;
  Arabia_To_SimplifiedChinese = Arabia_To_SimplifiedChinese;

  /**
   * 触摸开始
   **/
  touchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  /**
   * 触摸结束
   **/
  touchEnd(e) {
    let deltaX = e.changedTouches[0].clientX - this.touchStartX;
    let deltaY = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX >= 0) {
        if (this.curTab !== 'chapter') {
          this.changeTab('chapter');
        }
      } else {
        if (this.curTab !== 'activity') {
          this.changeTab('activity');
        }
      }
    }
  }

  onLoad(option) { // option为object类型，会序列化上个页面传递的参数
    this.courseId = option.courseId;
    this.classId = option.classId;
    this.loading = true;
    this.changeTab('chapter');
  }

  onShow() { // 各种活动参加完回来后，返回这一页，刷新页面
    plus.navigator.setStatusBarBackground('#ffffff');
    if (this.curTab === 'activity') {
      this.getActivitiesList();
    } else if (this.curTab === 'chapter') {
      this.getChapterList();
    }
  }

  // 监听页面滚动
  pageScroll(e) {
    this.$refs.chapters.pageScroll(e);
    if (e.detail.scrollTop > 160) { // 超过背景图
      this.showFixedNavBar = true;
    } else {
      this.showFixedNavBar = false;
    }
  }

  // 获取章节列表
  @GET(TAC.getClassCourseChapterList, ['courseId', 'classId'])
  getChapterList(params, result) {
    this.classInfo.imgUrl = result.data.imgUrl;
    this.classInfo.className = result.data.className;
    this.classInfo.classAssistant = result.data.classAssistant;
    this.classInfo.classTeacher = result.data.classTeacher;
    this.classInfo.type = result.data.type;
    this.activeFlag = result.data.activeFlag;
    this.chapterList = result.data.appChapterListResList;
    this.classInfo.labelTxt = '';
    if (result.data.type) { // 是否为公开课->班课类型：0普通1慕课
      this.classInfo.labelTxt = '公开课';
    }
    if (result.data.gokFlag) { // 是否机构班课(国科一键开课班课），默认为0->否
      this.classInfo.labelTxt = '国科';
    }
    this.enterFlag = result.data.enterFlag;
    if (!this.enterFlag) { // 已关闭
      this.$refs.gokPopup.open();
    }
    this.loading = false;
  }

  // 获取活动列表
  @GET(TAC.getClassCourseActivitiesList, ['status', 'classId'])
  getActivitiesList(params, result) {
    this.activityList = result.data.appActivityDataResList;
    this.loading = false;
  }

  // 切换章节与活动tab
  changeTab(val) {
    this.curTab = val;
    if (this.curTab === 'activity') {
      this.getActivitiesList();
    } else if (this.curTab === 'chapter') {
      this.getChapterList();
    }
  }

  // 活动筛选状态
  changeActivitiesStatus() {
    this.$refs.sheetPopup.open();
  }

  // 接收活动状态值的变化
  receptActStatus(value) {
    if (this.currentActState !== value) {
      this.currentActState = value;
      if (value === '全部') {
        this.status = 3;
      } else if (value === '进行中') {
        this.status = 1;
      } else if (value === '已结束') {
        this.status = 2;
      }
      this.$refs.sheetPopup.close();
      this.getActivitiesList();
    }
  }

  // 返回列表页
  returnCCList() {
    uni.navigateBack({
      delta: 1
    });
  }

  // 返回班课列表页
  close() {
    uni.navigateTo({
      url: `/pages/index/index`
    });
    setTimeout(() => {
      this.$bus.$emit('toggleTab', 1);
    }, 100);
  }
}
</script>

<style lang="scss" scoped>
.classCourseDetail {
  width: px2Rpx(750);
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #F4F5F6;
  position: relative;

  .titleWrap {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: px2Rpx(74);
    right: px2Rpx(28);
    height: px2Rpx(88);

    .titleWrap_title {
      width: px2Rpx(648);
      font-size: px2Rpx(36);
      font-weight: bold;
      color: #101010;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .w510 {
      width: px2Rpx(510);
    }

    .w648 {
      width: px2Rpx(648);
    }

    .openCalss_label {
      width: px2Rpx(104);
      height: px2Rpx(40);
      background-color: #3769FF;
      border-radius: px2Rpx(8);
      font-size: px2Rpx(24);
      color: #FFFFFF;
      text-align: center;
      line-height: px2Rpx(40);
      position: absolute;
      right: px2Rpx(28);
      top: px2Rpx(24);
    }
  }

  .scrollHeight {
    height: 100%;

    .classCourseDetail_img {
      width: px2Rpx(750);
      height: px2Rpx(320);
      position: relative;

      image {
        width: px2Rpx(750);
        height: px2Rpx(320);
        display: block;
      }

      .mask {
        position: absolute;
        left: 0;
        top: 0;
        width: px2Rpx(750);
        height: px2Rpx(320);
        background-color: rgba(0, 0, 0, 0.2);
        z-index: 100;
      }
    }

    .showSection {
      width: px2Rpx(750);
      height: px2Rpx(88);
      position: absolute;
      left: px2Rpx(28);
      display: flex;
      flex-direction: row;
      align-items: center;

      .smallIcon {
        z-index: 102;
        width: px2Rpx(66);
        height: px2Rpx(66);
      }
    }

    .classCourseDetail_wrap {
      z-index: 101;
      flex: 1;
      width: px2Rpx(750);
      box-sizing: border-box;
      position: relative;

      .classCourseDetail_header {
        margin-top: px2Rpx(-142);
        width: px2Rpx(718);
        background: #FFFFFF;
        box-shadow: px2Rpx(0) px2Rpx(6) px2Rpx(20) px2Rpx(0) rgba(0, 0, 0, 0.08);
        border-radius: px2Rpx(16);
        padding: px2Rpx(40) px2Rpx(30);
        box-sizing: border-box;

        .classCourseDetail_header_top {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;

          .classCourse_name {
            margin-top: px2Rpx(-6);
            font-size: px2Rpx(38);
            font-weight: bold;
            color: #101010;

            &.classNameWidth {
              width: px2Rpx(520);
            }
          }

          .label {
            width: px2Rpx(104);
            height: px2Rpx(40);
            background-color: #3769FF;
            border-radius: px2Rpx(8);
            font-size: px2Rpx(24);
            color: #FFFFFF;
            text-align: center;
            line-height: px2Rpx(40);
          }
        }

        .classCourseDetail_header_bottom {
          margin-top: px2Rpx(36);

          .classCourseDetail_header_bottom_item {
            margin-bottom: px2Rpx(20);
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: px2Rpx(24);

            &:last-child {
              margin-bottom: px2Rpx(0);
            }

            .classCourseDetail_teacher {
              width: px2Rpx(96);
              display: flex;
              justify-content: flex-end;
              flex-direction: row;
              color: #A1A1A1;
            }

            .classCourseDetail_teacher_item {
              margin-left: px2Rpx(20);
              height: px2Rpx(40);
              line-height: px2Rpx(40);
              background: #F4F5F6;
              border-radius: px2Rpx(8);
              padding: px2Rpx(0) px2Rpx(16);
              color: #666666;
            }
          }
        }
      }

      .classCourseTab {
        box-sizing: border-box;
        padding: px2Rpx(22) px2Rpx(162);
        width: px2Rpx(750);
        height: px2Rpx(80);
        background: #FFFFFF;
        //margin-top: px2Rpx(16);

        .classCourseTab_item_wrap {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;

          .classCourseTab_item {
            font-size: px2Rpx(26);
            font-weight: 500;
            color: $gok-text-color-default-theme;

            &.active {
              color: $gok-text-color-active-theme;
              font-weight: 800;
              font-size: px2Rpx(26);
              position: relative;
            }

            &.active:before {
              content: "";
              width: px2Rpx(36);
              height: px2Rpx(6);
              border-radius: px2Rpx(5);
              position: absolute;
              bottom: px2Rpx(-14);
              left: px2Rpx(8);
              background: $gok-border-bottom-color;
            }
          }
        }

        .activities_status_wrap {
          display: flex;
          flex-direction: row;
          align-items: center;

          .activities_status_txt {
            font-size: px2Rpx(28);
            color: #101010;
          }

          .activities_status_img {
            margin-left: px2Rpx(12);
            width: px2Rpx(20);
            height: px2Rpx(22);
            display: block;
          }
        }
      }
    }
  }
}
</style>
<style>
page {
  background-color: #f4f5f6;
}
</style>
