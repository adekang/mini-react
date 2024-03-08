import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

export class FiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any;
	ref: Ref;

	index: number;
	sibling: FiberNode | null;
	child: FiberNode | null;
	return: FiberNode | null;

	memoizedProps: Props | null;
	alternate: FiberNode | null;
	flags: Flags;
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		// 用于保存与该fiber节点相关联的DOM节点或组件实例信息
		this.stateNode = null;
		// 例如若是 函数组件 则保存的是 ()=>{} 函数
		this.type = null;

		// 构成链表结构
		// 指向父fiberNode
		this.return = null;
		// 指向第一个子fiberNode
		this.child = null;
		// 指向下一个兄弟fiberNode
		this.sibling = null;
		// 当前fiber的index
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		// 刚开始工作的props是什么
		this.pendingProps = pendingProps;
		// 工作完后确定下来的props是什么
		this.memoizedProps = null;

		// 在fiberNode 与 对应 fiberNode 切换
		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
	}
}
