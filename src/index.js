import {yaml, mustache} from './read'
import {parse} from './parse'
import {resolve} from 'path'

export async function render(cabalfile, datafile, basedir = resolve('.')){
	return mustache(resolve(basedir, cabalfile), await parse(basedir, await yaml(resolve(basedir, datafile))))
}
