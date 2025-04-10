import {
	appendChildToContainer,
	commitUpdate,
	Container,
	removeChild
} from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import {
	ChildDeletion,
	MutationMask,
	NoFlags,
	Placement,
	Update
} from './fiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';

let nextEffect: FiberNode | null = null;
export function commitMutationEffects(finishedWork: FiberNode) {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			// 从当前节点开始向上遍历 DFS
			up: while (nextEffect !== null) {
				// 处理 flags
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;
				// 遍历兄弟节点
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				// 遍历父节点
				nextEffect = nextEffect.return;
			}
		}
	}
}

/**
 *
 * @param finishedWork 真正存在flags的节点
 *
 */
const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement; // 移除Placement标记
	}
	if ((flags & ChildDeletion) !== NoFlags) {
		const deletions = finishedWork.deletions;
		if (deletions !== null) {
			deletions.forEach((childToDelete) => {
				commitDeletion(childToDelete);
			});
		}
		finishedWork.flags &= ~ChildDeletion;
	}
	if ((flags & Update) !== NoFlags) {
		// TODO
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update;
	}
	if ((flags & ChildDeletion) !== NoFlags) {
		// TODO
		finishedWork.flags &= ~ChildDeletion;
	}
};

// 执行 DOM 插入操作，将 FiberNode 对应的 DOM 插入 parent DOM 中
const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行Placement操作', finishedWork);
	}

	const hostParent = getHostParent(finishedWork);
	if (hostParent !== null) {
		appendPlacementIntoContainer(finishedWork, hostParent);
	}
};

// 获取 parent DOM
const getHostParent = (fiber: FiberNode): Container | null => {
	let parent = fiber.return;
	while (parent !== null) {
		if (parent.tag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parent.tag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	if (__DEV__) {
		console.warn('未找到 host parent', fiber);
	}
	return null;
};

function appendPlacementIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementIntoContainer(child, hostParent);
		let sibling = child.sibling;

		if (sibling !== null) {
			appendPlacementIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}

/**
 * 删除需要考虑：
 * HostComponent：需要遍历他的子树，为后续解绑ref创造条件，HostComponent本身只需删除最上层节点即可
 * FunctionComponent：effect相关hook的执行，并遍历子树
 */
function commitDeletion(childToDelete: FiberNode) {
	let rootHostNode: FiberNode;

	// 递归子树
	commitNestedComponent(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				if (rootHostNode === null) {
					rootHostNode = unmountFiber;
				}
				// 解绑ref
				return;
			case HostText:
				if (rootHostNode) {
					rootHostNode = unmountFiber;
				}
				return;
			case FunctionComponent:
				// effect相关操作
				return;

			default:
				if (__DEV__) {
					console.warn('未支持的unmount类型', unmountFiber);
				}
				return;
		}
	});

	// @ts-ignore
	if (rootHostNode) {
		const hostParent = getHostParent(childToDelete) as Container;
		removeChild(rootHostNode.stateNode, hostParent);
	}

	childToDelete.return = null;
	childToDelete.child = null;
}

function commitNestedComponent(
	root: FiberNode,
	onCommitUnmount: (fiber: FiberNode) => void
) {
	let node = root;

	while (true) {
		onCommitUnmount(node);

		if (node.child !== null) {
			// 向下
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === root) {
			// 终止条件
			return;
		}
		while (node.sibling === null) {
			// 向上
			if (node.return === null || node.return === root) {
				// 终止条件
				return;
			}
			// 归
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}
