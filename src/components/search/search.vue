<template>
    <div class="search">
        <div class="search-box-wrapper">
            <search-box ref="searchBox" @query="onQueryChange"></search-box>
        </div>
        <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
            <div class="shortcut">
                <div class="hot-key">
                    <h1 class="title">热门搜索</h1>
                    <ul>
                        <li @click="addQuery(item.k)" class="item" v-for="(item,index) in hotKey" :key="index">
                            <span>{{item.k}}</span>
                        </li>
                    </ul>
                </div>
                <div class="search-history" v-show="searchHistory.length">
                    <h1 class="title">
                        <span class="text">搜索历史</span>
                        <span class="clear" @click="deleteAll">
                            <i class="icon-clear"></i>
                        </span>
                    </h1>
                    <search-list @select="addQuery" @delete="deleteOne" :searches='searchHistory'></search-list>
                </div>
            </div>
        </div>
        <div ref="searchResult" class="search-result" v-show="query">
            <suggest @select='saveSearch' :query='query' @listScroll="blurInput"></suggest>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box';
import {getHotSearch} from 'api/search.js';
import {ERR_OK} from 'api/config';
import Suggest from 'components/suggest/suggest.vue';
import SearchList from 'base/search-list/search-list';
import {mapActions, mapGetters} from 'vuex';
import {playlistMixin} from 'common/js/mixin';
export default {
    mixins: [playlistMixin],
    components: {
        SearchBox,
        Suggest,
        SearchList
    },
    created() {
        this._getHotKey();
    },
    data() {
        return {
            hotKey: [],
            query: ''
        }
    },
    computed: {
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods: {
        handlePlaylist(playlist) {
            const bottom = playlist.length > 0 ? '60px' : '';
            this.$refs.shortcutWrapper.style.bottom = bottom;
            this.$refs.searchResult.style.bottom = bottom;
        },
        _getHotKey() {
            getHotSearch().then((res) => {
                if(res.code === ERR_OK) {
                    console.log(res.data.hotkey);
                    //截取前十个数据
                    this.hotKey = res.data.hotkey.slice(0, 10);
                }
            })
        },
        //点击热门搜索的元素执行
        addQuery(query) {
            this.$refs.searchBox.setQuery(query);
        },
        onQueryChange(query) {
            this.query = query;
        },
        //监听列表滚动，调用子组件的blur方法让input输入框失去焦点
        blurInput() {
            this.$refs.searchBox.blur();
        },
        //存储搜索历史的方法(点击搜索列表执行)
        saveSearch() {
            this.saveSearchHistory(this.query)
        },
        //点击删除健执行
        deleteOne(item) {
            this.deleteSearchHistory(item);
        },
        //点击全部删除建执行
        deleteAll() {
            this.clearSearchHistory();
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory',
            'clearSearchHistory'
        ])
    }
}
</script>

<style scoped lang="stylus">
    @import "~common/stylus/variable";
    @import "~common/stylus/mixin";
    .search
        .search-box-wrapper
            margin 20px;
        .shortcut-wrapper
            position fixed;
            top 178px;
            bottom 0;
            width 100%;
            .shortcut
                height 100%;
                overflow hidden;
                .hot-key
                    margin 0 20px 20px 20px;
                    .title
                        margin-bottom 20px;
                        font-size $font-size-medium;
                        color $color-text-l;
                    .item
                        display inline-block;
                        padding 5px 10px;
                        margin 0 20px 10px 0;
                        border-radius 6px;
                        background $color-highlight-background;
                        font-size $font-size-medium;
                        color $color-text-d;
                .search-history
                    position relative;
                    margin 0 20px;    
                    .title
                        display flex;
                        align-items center;
                        height 40px;
                        font-size $font-size-medium;
                        color $color-text-l;
                        .text
                            flex 1;
                        .clear
                            extend-click()
                            .icon-clear
                                font-size: $font-size-medium;
                                color $color-text-d;
        .search-result
            position fixed;
            width 100%;
            top 178px;
            bottom 0;                        
</style>
