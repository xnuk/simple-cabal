import {getAll} from './asterisk'
import {resolve} from 'path'

function addDepend(o){
	if(o.depend){
		const z = o.depend
		Object.keys(z).forEach(v => {this.delete(v); this.add(v + ' ' + z[v])})
	}
	return this
}

export async function parse(basedir, o){
	const nil = (e => (console.error(e), null))
	const lib  = await mc(basedir, o, 'lib' ).catch(nil)
	const exe  = await mc(basedir, o, 'exe' ).catch(nil)
	const test = await mc(basedir, o, 'test').catch(nil)

	delete o.all
	delete o.lib
	delete o.exe
	delete o.test

	const header = Object.keys(o).map(v => v + ': ' + o[v]).join('\n')
	return {header, lib, exe, test}
}

async function mc(basedir, o, v){
	const z = o[v]
	if(z == null) return null

	const expose = z.expose || ['*']

	const {modules, others, deps} = await getAll(resolve(basedir, z.src), expose)
	deps::addDepend(o.all || (o.all = {}))::addDepend(z)

	const other = v === 'lib' ? others : (() => {
		const a = new Set(modules)
		a.delete('Main')
		return a
	})()

	return {
		'depend': Array.from(deps).sort().join(', '),
		'expose': Array.from(modules).sort().join(', '),
		'other': Array.from(other).sort().join(', '),
		'src': z.src,
		'main': z.main + '.hs',
		'name': z.name,
		'extension': [].concat(o.all.extension || [], z.extension || []).join(', ') || false
	}
}
