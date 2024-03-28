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
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		// 在fiberNode 与 对应 fiberNode 切换
		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
		// 子树的副作用
		this.subtreeFlags = NoFlags;
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
	 * @param container  容器
	 * @param hostRootFiber DOM根节点
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
		// 首次加载
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.type = current.type;
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// 更新
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue; // 共用同一个 updateQueue对象
	wip.child = current.child;
	wip.memoizedState = current.memoizedState;
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
