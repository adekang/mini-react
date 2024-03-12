import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
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
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.error('workLoop发生错误', e);
			wip = null;
		}
	} while (true);
}

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
	const node: FiberNode | null = fiber;

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
