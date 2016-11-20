import {safeLoad, FAILSAFE_SCHEMA} from 'js-yaml'
import {render} from 'mustache'
import {readFile} from 'fs'

function file(filename){
	return new Promise((ok, err) => readFile(filename, {encoding: 'utf8'}, (e, d) => e ? err(e) : ok(d)))
}

export async function yaml(fn){
	return safeLoad(await file(fn), {schema: FAILSAFE_SCHEMA})
}

export async function mustache(fn, data){
	return render(await file(fn), data)
}
