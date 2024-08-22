import type { ComponentPublicInstance } from 'vue';
// import type GroupRowComponent from './components/GroupRowSelection/GroupRowComponent.vue';

export interface IGroupRowReadyParameter {
  key: string[];
  setCheckedState: Function;
  // component: ComponentPublicInstance<typeof GroupRowComponent>;
}