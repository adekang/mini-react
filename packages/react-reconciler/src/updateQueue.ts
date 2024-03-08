import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	// 接受setState 传的值 或者()=>{}函数
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

/**
 * 创建一个更新
 * @param action 传入的值 或者函数
 * @returns 返回一个更新
 */
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

/**
 * 创建一个更新队列
 * @returns  返回一个更新队列
 */
export const updateQueue = <Action>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<Action>;
};

/**
 * 向队列中添加更新
 * @param updateQueue
 * @param update
 */
export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action>,
	update: Update<Action>
) => {
	updateQueue.shared.pending = update;
};

/**
 * UpdateQueue消费更新
 * @param baseState 初始状态
 * @param pendingUpdate 待处理的更新
 */
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		// action 传的是函数 还是值
		if (action instanceof Function) {
			result.memoizedState = action(baseState);
		} else {
			result.memoizedState = action;
		}
	}

	return result;
};
