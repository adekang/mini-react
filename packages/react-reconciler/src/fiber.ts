import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

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
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	subtreeFlags: Flags;

	updateQueue: unknown;
	deletions: FiberNode[] | null; // 删除的子节点
	/**
	 *
	 * @param tag 标签
	 * @param pendingProps 待更新的props
	 * @param key key
	 */
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
		this.memoizedProps = null; // 已经更新完的属性
		this.memoizedState = null; // 更新完成后新的 State
		this.updateQueue = null; // 更新计划队列

		// 指向节点的备份节点，用于在协调过程中进行比较
		this.alternate = null;
		// 表示节点的副作用类型，如更新、插入、删除等
		this.flags = NoFlags;
		// / 表示子节点的副作用类型，如更新、插入、删除等
		this.subtreeFlags = NoFlags;
		this.deletions = null;
	}
}

/**
 * FiberRootNode
 */
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null; // 最终更新完成以后的fiber树
	/**
	 * @param container  容器 div#root
	 * @param hostRootFiber React的根节点
	 */
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

/**
 * 创建一个新的fiberNode
 * @param current 当前工作的fiberNode
 * @param pendingProps 刚开始工作的props
 * @returns 返回一个新的fiberNode
 */
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	if (wip == null) {
		// 首屏渲染时（mount）
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// 非首屏渲染时（update）
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue; // 共用同一个 updateQueue对象
	wip.child = current.child;
	wip.memoizedState = current.memoizedState;
	wip.memoizedProps = current.memoizedProps;
	return wip;
};

/**
 * 创建一个fiberNode
 * @param element
 * @returns
 */
export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
