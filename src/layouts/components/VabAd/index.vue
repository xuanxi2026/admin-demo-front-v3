<template>
  <div class="vab-ad">
    <el-carousel v-if="noticeList.length" :autoplay="true" :interval="3000" direction="vertical" height="30px" indicator-position="none">
      <el-carousel-item v-for="item in noticeList" :key="item.id">
        <el-tag type="warning">公告</el-tag>
        <a href="javascript:void(0)" @click.prevent="openNoticeCenter(item)">{{ item.title }}</a>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
  import { getPublishedNotices } from "@/api/noticeManagement";

  export default {
    name: "VabAd",
    data() {
      return {
        noticeList: [],
      };
    },
    created() {
      this.fetchData();
    },
    methods: {
      async fetchData() {
        const { data } = await getPublishedNotices({ pageSize: 5 });
        this.noticeList = data || [];
      },
      openNoticeCenter(item) {
        this.$router.push({
          name: "Notification",
          query: item?.id ? { noticeId: item.id } : {},
        });
      },
    },
  };
</script>
<style lang="scss" scoped>
  .vab-ad {
    height: 30px;
    padding-right: $base-padding;
    padding-left: $base-padding;
    margin-bottom: -20px;
    line-height: 30px;
    cursor: pointer;

    a {
      color: #999;
      margin-left: 8px;
    }
  }
</style>
