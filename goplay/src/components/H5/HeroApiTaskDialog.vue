<template>
  <div>
    <!-- 進行中任務 -->
    <HeroApiRunningTaskDialog
      @onShowTaskDetails="onShowTaskDetails"
      @onCloseTaskDetails="onCloseTaskDetails"
      @onViewCompleted="isShowCompleteTaskDetails = true"
    />
    <!-- 已完成任務 -->
    <HeroApiCompletedTaskDialog
      v-model="isShowCompleteTaskDetails"
      @onShowTaskDetails="onShowTaskDetails"
      @onCloseTaskDetails="onCloseTaskDetails"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import HeroApiRunningTaskDialog from './HeroApiRunningTaskDialog.vue';
import HeroApiCompletedTaskDialog from './HeroApiCompletedTaskDialog.vue';

/** 教師任務完成條件 */
export interface StudyTaskCriteria {
  /** 條件 */
  criteria: string;
  /** 是否為魔王任務 */
  isBoss: boolean;
  /** 賽事ID */
  contestId: number;
}

/** 任務詳情類型 */
export enum TaskDetailType {
  UniverseTask,
  StudyTask,
}

@Component({
  components: {
    HeroApiRunningTaskDialog,
    HeroApiCompletedTaskDialog,
  },
})
export default class HeroApiTaskDialog extends Vue {
  /** 是否顯示已完成任務 */
  protected isShowCompleteTaskDetails: boolean = false;

  /** 顯示任務詳情 */
  @Emit('onShowTaskDetails')
  protected onShowTaskDetails(): void {
    /** */
  }

  /** 關閉任務詳情 */
  @Emit('onCloseTaskDetails')
  protected onCloseTaskDetails(): void {
    /** */
  }
}
</script>

<style lang="scss">
.task-details-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.task-details-container {
  width: 95%;
  height: auto;
  max-height: 95%;
  position: relative;
  overflow: hidden;
}

.background-images {
  position: absolute;
  inset: 0;
  z-index: 0;

  img {
    position: absolute;
  }

  .corner-image {
    width: 52px;
    height: 52px;
    object-fit: cover;
  }

  .top-left {
    top: 0;
    left: 0;
  }
  .top-right {
    top: 0;
    right: 0;
    transform: scaleX(-1);
  }
  .bottom-left {
    bottom: 0;
    left: 0;
    transform: scaleY(-1);
  }
  .bottom-right {
    bottom: 0;
    right: 0;
    transform: scale(-1);
  }

  .top-middle,
  .bottom-middle {
    left: 52px;
    right: 52px;
    height: 52px;
    width: calc(100% - 104px);
    object-fit: fill;
  }

  .top-middle {
    top: 0;
  }
  .bottom-middle {
    bottom: 0;
    transform: scaleY(-1);
  }

  .side-image {
    top: 48px;
    width: 52px;
    height: calc(100% - 96px);
    object-fit: fill;
  }

  .left {
    left: 0;
  }
  .right {
    right: 0;
    transform: scaleX(-1);
  }

  .center-image {
    top: 48px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 96px);
    height: calc(100% - 96px);
    object-fit: fill;
  }
}

.content-container {
  position: relative;
  z-index: 10;
  border: 10px solid transparent;
  padding: 2px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.task-list-container {
  display: flex;
  flex-direction: column;
  width: 26%;
  margin-right: 2px;
}

.universe-task-list,
.teacher-task-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: fit-content;
}

.task-header {
  position: relative;
}

.task-header-bg {
  width: 100%;
  height: auto;
}

.task-header-title {
  font-size: 1.5vw;
  font-weight: bold;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
}

.task-items {
  list-style: none;
  flex: 1;
  overflow-y: auto;
  background-color: #36404d;
  min-height: 0;
  font-size: 1.5vw;

  transition: background-color 0.3s ease;

  &.selected-running-task {
    background-color: rgba(97, 200, 253, 0.5); // Adjust the color and opacity as needed
  }

  &.selected-completed-task {
    background-color: rgba(97, 200, 253, 0.5); // Adjust the color and opacity as needed
  }
}

.task-item {
  cursor: pointer;
  padding: 1vw 1vw;
  color: white;
  display: flex;
  align-items: center;
}

.task-item:last-child {
  border-bottom: 0;
}

.task-item:hover {
  background-color: #4b5563;
}

.task-icon {
  margin-right: 1.5vw;
  margin-left: 1.5vw;
  width: 1.5vw;
  height: 1.5vw;
}

.task-pagination-container {
  position: relative;
  margin-bottom: 4px;
}

.pagination-bg {
  width: 100%;
  height: auto;
}

.task-pagination {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.button-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  aspect-ratio: 266 / 72;
  height: fit-content;
}

.button-bg {
  width: 100%;
  height: auto;
}

.view-completed-button {
  position: absolute;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 60%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  aspect-ratio: 15 / 4;
}

.button-inner-bg {
  position: absolute;
  width: 100%;
  height: auto;
}

.button-text {
  position: relative;
  z-index: 1;
  color: white;
  font-weight: bold;
  font-size: 1.4vw;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.task-info-label {
  font-size: 2vw;
  font-weight: bold;
  flex: 0 0 30%;
}

.task-info-content {
  font-size: 1.6vw;
  line-height: 1.5;
  flex: 1;
  overflow-y: auto;
  text-align: left;
  padding-left: 10px;
}

.task-action-buttons {
  display: flex;
  justify-content: flex-end;
  background-color: #36404d;
}

.button-wrapper {
  position: relative;
  width: auto;
  height: 100%;
  aspect-ratio: 15 / 4;
  margin: 0.5vw 1vw 1vw 1vw;

  &:first-child {
    margin-left: 0;
  }
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-button {
  position: relative;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: bold;
  font-size: 2vw;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.task-action-buttons .el-button:first-child {
  margin-left: 0;
}

// Optional: Custom styles for the buttons
.task-action-buttons .el-button--danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.task-action-buttons .el-button--primary {
  background-color: #007bff;
  border-color: #007bff;
}

// Hover effects
.task-action-buttons .el-button--danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.task-action-buttons .el-button--primary:hover {
  background-color: #0056b3;
  border-color: #004085;
}

.contest-button-container {
  position: relative;
  display: inline-block;
  width: auto;
  height: 100%;
  margin-left: 10px;
  margin-right: 10px;
  padding-left: 5px;
  padding-right: 5px;
}

.contest-button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.contest-button {
  position: relative;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: bold;
  font-size: 1.6vw;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 5px;
  padding-right: 5px;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.task-details-grid {
  display: grid;
  grid-template-rows: auto 1fr auto auto auto auto;
  height: 100%;
}

.task-name-description {
  overflow-y: auto;
}

.task-info-container {
  background-color: #36404d;
  color: white;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
}

.task-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  padding-top: 10px;
  padding-bottom: 10px;
}

.task-details-right {
  width: 100%;
  margin-left: 2px;
}

.task-title {
  position: relative;
}

.task-title-bg {
  width: 100%;
  height: auto;
}

.task-footer-bg {
  width: 100%;
  height: auto;
}

.task-title-text {
  font-size: 2vw;
  font-weight: bold;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
}

.task-criteria-list {
  list-style-type: none;

  li {
    text-align: left;
    display: flex;
    align-items: flex-start;
    margin-bottom: 5px;
  }

  .bullet {
    color: orange;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .gray-bullet {
    color: gray;
    margin-right: 10px;
    flex-shrink: 0;
  }
}

.button-icon {
  position: relative;
  right: 5px;
  width: auto;
  height: 100%;
}

.contest-button-icon {
  width: 10px;
  height: 10px;
  margin-right: 2px;
  margin-left: 2px;
}
</style>
