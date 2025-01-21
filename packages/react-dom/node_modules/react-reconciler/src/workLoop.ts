import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

// wip: work in progress
let wip: FiberNode | null = null;

//  指向需要遍历的第一个fiberNode
function prepareFreshStack(root: FiberRootNode) {
	wip = createWorkInProgress(root.current, {});
}

/**
 * 在fiber上调度更新
 * @param fiber
 */
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// todo 调度功能
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

/**
 * 从fiber链表中找到顶层节点 fiberRootNode
 */
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;

	// 找到根节点
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}

	return null;
}
function renderRoot(root: FiberRootNode) {
	// 初始化
	// 初始化wip
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.error('workLoop发生错误', e);
			}
			wip = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	// 这里已经生成了wip fiberNode树 树中带有 flags
	commitRoot(root);
}

/**
 * commit阶段的入口
 * @param root
 */
function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}

	// 重置
	root.finishedWork = null;

	// 判断是否存在3个阶段需要执行的操作
	// root flags  root subtreeFlags
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) != NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) != NoFlags;
	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation
		commitMutationEffects(finishedWork);

		root.current = finishedWork;
		// layout
	} else {
		root.current = finishedWork;
	}
}

/**
 * render阶段的入口
 */
function workLoop() {
	while (wip !== null) {
		preformUnitOfWork(wip);
	}
}

function preformUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		wip = next;
	}
}

/**
 * 没有子节点遍历兄弟节点
 * @param fiber
 */
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			wip = sibling;
			return;
		}
		node = node.return;
		wip = node;
	} while (node !== null);
}
