import { FiberNode } from './fiber';

export function renderWithHooks(wip: FiberNode) {
	const Component = wip.type;
	const props = wip.pendingProps;
	const Children = Component(props);
	return Children;
}
