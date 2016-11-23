// @flow
import {execFile} from 'child_process'

function filterMap<v, r>(a: Array<v>, f: v => ?r): Array<r> {
	const arr = []
	a.forEach(v => {
		const a = f(v)
		if(a != null) arr.push(a)
	})
	return arr
}

function fm(f) { return filterMap(this, f) }

function union<a>(x: Set<a>, ...xs: Array<Set<a>>): Set<a> {
	const set = new Set(x)
	xs.map(s => s.forEach(v => set.add(v)))
	return set
}

const dummySet = new Set()

export function getAll(src: string, names: Array<string> = ['*']): Promise<{modules: Set<string>, others: Set<string>, deps: Set<string>}> {
	if(names.length === 0) Promise.resolve({modules: [], deps: new Set()})

	return new Promise((ok, err) => execFile('find', [src, '-type', 'f', '-name', '*.hs', '-exec', 'cat', '{}', ';'], (e, stdout) => {
		if(e) return err(e)
		if(stdout == null) return err(e)
		if(stdout instanceof Buffer) stdout = stdout.toString('utf8')

		const reg = /^import\s*(?:qualified)?\s+("[^\s]+)"|^module\s+([^(\s]+)/
		const z: Map<string, Set<string>> = new Map()

		stdout.split(/\s*\n\s*/)::fm(v => {
			const a = v.match(reg)
			return a && (a[1] || a[2])
		}).reduce((p, c) => {
			if(c[0] === '"') return p.add(c.slice(1))
			const s = new Set()
			z.set(c, s)
			return s
		}, dummySet)

		stdout = null

		const xs = new Set(z.keys())
		const xsarr = Array.from(xs)
		const modules: Set<string> = new Set([].concat(...names::fm(v => {
			if(v.indexOf('*') === -1) return xs.has(v) ? v : null
			const regex = new RegExp('^' + v.replace(/\./g, '\\.').replace(/\*/g, '[^\.]+') + '$')
			return xsarr.filter(v => regex.test(v))
		})))
		const others: Set<string> = (() => {
			const a = new Set(xs)
			modules.forEach(v => a.delete(v))
			return a
		})()

		const deps = union(...modules::fm(v => z.get(v)))
		ok({modules, others, deps})
	}))
}
