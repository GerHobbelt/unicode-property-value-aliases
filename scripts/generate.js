'use strict';

const fs = require('fs');
const jsesc = require('jsesc');
const propertyAliases = require('unicode-property-aliases');

const parsePropertyValueAliases = function() {
	const propertyValueAliasesPerProperty = new Map();
	const source = fs.readFileSync('./data/PropertyValueAliases.txt', 'utf8');
	const lines = source.split('\n');
	lines.forEach(function(line) {
		if (!line || /^#/.test(line)) {
			return;
		}
		const data = line.split('#')[0].split(';');
		const propertyAlias = data[0].trim();
		const property = propertyAliases.get(propertyAlias);
		if (!propertyValueAliasesPerProperty.has(property)) {
			propertyValueAliasesPerProperty.set(property, new Map());
		}
		// In the case of `ccc`, there are 4 fields. The second field is numeric,
		// third is abbreviated, and fourth is long. We don’t need the numeric
		// field.
		if (property == 'Canonical_Combining_Class') {
			data.splice(1, 1);
		}
		const map = propertyValueAliasesPerProperty.get(property);
		const alias1 = data[1].trim();
		const canonicalName = data[2].split('#')[0].trim();
		console.assert(!map.has(alias1));
		map.set(alias1, canonicalName);
		const remaining = data.slice(3);
		for (const otherAliasData of remaining) {
			const otherAlias = otherAliasData.trim();
			console.assert(!map.has(otherAlias));
			map.set(otherAlias, canonicalName);
		}
	});
	return propertyValueAliasesPerProperty;
};

const mappings = parsePropertyValueAliases();
const header = '// Generated using `npm run build`. Do not edit!';
const output = `${ header }\nmodule.exports = ${
	jsesc(mappings, {
		'compact': false
	})
};\n`;
require('fs').writeFileSync('./index.js', output);
