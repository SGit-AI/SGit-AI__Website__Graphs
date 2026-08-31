"""A small JSON Schema validator, so the gate needs no new dependency.

@module Supports the subset the AIUC-1 schemas use: type, required, properties,
items, enum, const, pattern, minLength, minItems, format (date and date-time),
additionalProperties and $ref (local `#/...` and sibling-file). It reports every
failure with a JSON pointer rather than stopping at the first, because a release
that fails validation is reviewed, not retried.
"""
import json
import os
import re

TYPES = {'object': dict, 'array': list, 'string': str, 'integer': int, 'number': (int, float),
         'boolean': bool, 'null': type(None)}
DATE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
DATE_TIME = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$')


class Validator:
    def __init__(self, schema_dir):
        self.schema_dir = schema_dir
        self.cache = {}

    def load(self, name):
        if name not in self.cache:
            with open(os.path.join(self.schema_dir, name), encoding='utf-8') as handle:
                self.cache[name] = json.load(handle)
        return self.cache[name]

    def validate(self, instance, schema, pointer='', root=None):
        root = root if root is not None else schema
        errors = []
        if '$ref' in schema:
            ref = schema['$ref']
            if ref.startswith('#/'):
                target = root
                for step in ref[2:].split('/'):
                    target = target[step]
                return self.validate(instance, target, pointer, root)
            target = self.load(ref)
            return self.validate(instance, target, pointer, target)

        kinds = schema.get('type')
        if kinds is not None:
            wanted = kinds if isinstance(kinds, list) else [kinds]
            allowed = tuple(TYPES[k] for k in wanted)
            ok = isinstance(instance, allowed)
            if isinstance(instance, bool) and 'boolean' not in wanted:
                ok = False
            if ok and isinstance(instance, int) and not isinstance(instance, bool):
                ok = 'integer' in wanted or 'number' in wanted
            if not ok:
                return [(pointer, 'expected type %s, found %s' % (
                    '|'.join(wanted), type(instance).__name__))]

        if 'const' in schema and instance != schema['const']:
            errors.append((pointer, 'expected the constant %r' % (schema['const'],)))
        if 'enum' in schema and instance not in schema['enum']:
            errors.append((pointer, 'value %r is not one of %r' % (instance, schema['enum'])))
        if isinstance(instance, str):
            if 'pattern' in schema and not re.search(schema['pattern'], instance):
                errors.append((pointer, 'value %r does not match %s' % (
                    instance[:60], schema['pattern'])))
            if 'minLength' in schema and len(instance) < schema['minLength']:
                errors.append((pointer, 'shorter than %d characters' % schema['minLength']))
            fmt = schema.get('format')
            if fmt == 'date' and not DATE.match(instance):
                errors.append((pointer, 'not an ISO-8601 date: %r' % instance))
            if fmt == 'date-time' and not DATE_TIME.match(instance):
                errors.append((pointer, 'not an ISO-8601 timestamp: %r' % instance))
        if isinstance(instance, list):
            if 'minItems' in schema and len(instance) < schema['minItems']:
                errors.append((pointer, 'needs at least %d items' % schema['minItems']))
            if 'items' in schema:
                for index, item in enumerate(instance):
                    errors.extend(self.validate(item, schema['items'],
                                                '%s/%d' % (pointer, index), root))
        if isinstance(instance, dict):
            for key in schema.get('required', []):
                if key not in instance:
                    errors.append((pointer, 'missing required property %r' % key))
            properties = schema.get('properties', {})
            for key, value in instance.items():
                if key in properties:
                    errors.extend(self.validate(value, properties[key],
                                                '%s/%s' % (pointer, key), root))
                elif schema.get('additionalProperties') is False:
                    errors.append((pointer, 'unexpected property %r' % key))
        return errors
