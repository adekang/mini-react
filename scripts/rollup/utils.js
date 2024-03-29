import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

const pakPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');
import replace from '@rollup/plugin-replace';

/**
 * 获取包的路径
 * @param {*} pkgName 包名
 * @param {*} isDist 是否是dist目录
 * @returns
 */
export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pakPath}/${pkgName}`;
}

/**
 * 获取包的package.json
 * @param {*} pkgName 包名
 * @returns
 */
export function getPackageJSON(pkgName) {
	const path = `${resolvePkgPath(pkgName)}/package.json`;

	const str = fs.readFileSync(path, { encoding: 'utf-8' });

	return JSON.parse(str);
}

/**
 * 获取rollup的基础插件
 * @param {*} typescript typescript的配置
 * @returns
 */
export function getBaseRollupPlugins({
	alias = {
		__DEV__: true,
		preventAssignment: true
	},
	typescript = {}
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
