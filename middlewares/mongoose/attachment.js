const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Schema } = require('mongoose');
const timestampsPlugin = require('./timestamps');
const ownerPlugin = require('./owner');

/**
 * @param {string} from
 * @param {string} to
 * @param {null|function} onData
 * @param {null|function} onFinish
 */
const copyFile = (from, to, { onData = null, onFinish = null }) =>
  new Promise((accept, reject) => {
    try {
      const inputStream = fs.createReadStream(from);
      const outputStream = fs.createWriteStream(to);

      outputStream.on('error', err => {
        reject(err);
      });

      inputStream.on('error', err => {
        reject(err);
      });

      if (onData) {
        inputStream.on('data', onData);
      }

      outputStream.on('finish', () => {
        if (onFinish) {
          onFinish();
        }
        accept();
      });

      inputStream.pipe(outputStream);
    } catch (err) {
      reject(err);
    }
  });

const serialize = (...funcs) => (...args) => {
  funcs.forEach(func => func(...args));
};

/**
 * @param {Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {boolean} multiple
 * @param {*} defaultValue
 * @param {string} output
 * @param {null|string} filenameField
 * @param {null|string} hashAlgorithm
 * @param {null|string} hashField
 * @param {null|string} sizeField
 * @param {boolean} author
 * @param {object} authorOptions
 * @param {boolean} timestamps
 * @param {object} timestampsOptions
 */
module.exports = (
  schema,
  {
    field = 'attachments',
    required = false,
    multiple = true,
    defaultValue = multiple ? [] : null,
    output,
    filenameField = 'file',
    hashAlgorithm = 'md5',
    hashField = 'hash',
    sizeField = 'size',
    author = false,
    authorOptions = { field: 'author' },
    timestamps = true,
    timestampsOptions = {},
  } = {},
) => {
  const attachmentSchema = new Schema({
    path: {
      type: String,
      required: true,
    },
  });

  if (filenameField) {
    attachmentSchema.add({
      [filenameField]: {
        type: String,
      },
    });
  }

  if (hashAlgorithm && hashField) {
    attachmentSchema.add({
      [hashField]: {
        type: String,
      },
    });
  }

  if (sizeField) {
    attachmentSchema.add({
      [sizeField]: {
        type: Number,
      },
    });
  }

  if (author) {
    attachmentSchema.plugin(ownerPlugin, authorOptions);
  }
  if (timestamps) {
    attachmentSchema.plugin(timestampsPlugin, timestampsOptions);
  }

  attachmentSchema.pre('save', function attachmentSchemaPreSave(next) {
    const hash = hashAlgorithm && hashField ? crypto.createHash(hashAlgorithm) : null;

    const onDataHash = hash ? data => hash.update(data) : () => {};

    const onDataSize = sizeField
      ? data => {
          this[sizeField] =
            typeof this[sizeField] === 'undefined' ? data.length : (this[sizeField] += data.length);
        }
      : () => {};

    const onFinishHash = hash
      ? () => {
          this[hashField] = hash.digest('hex');
        }
      : () => {};

    const from = this.path;
    // eslint-disable-next-line no-underscore-dangle
    const to = path.resolve(output, this._id.toString());

    if (filenameField) {
      this[filenameField] = path.basename(from);
    }

    copyFile(from, to, {
      onData: serialize(onDataHash, onDataSize),
      onFinish: onFinishHash,
    })
      .then(next)
      .catch(next);
  });

  schema.add({
    [field]: {
      type: multiple ? [attachmentSchema] : attachmentSchema,
      required,
      default: defaultValue,
    },
  });
};
