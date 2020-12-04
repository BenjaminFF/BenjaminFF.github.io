let fs = require('fs')
let fm = require('front-matter')
let path = require('path')
const uniqid = require('uniqid')

let filePath = path.resolve('./posts')
const mainUrl = 'https://raw.githubusercontent.com/BenjaminFF/BenjaminFF.github.io/master';

//调用文件遍历方法
let filePaths = [];
getReversedFilePaths(filePath)

let posts = [],
    mTags = [],
    mCategories = []

filePaths.forEach(filePath => {
    let content = fm(fs.readFileSync(filePath, 'utf8'))
    let { attributes } = content
    let { tags, categories, title, description, image = '', date } = attributes,
        url = process.argv[2] === 'prod' ? mainUrl + filePath.replace(__dirname, '')
            : filePath.replace(__dirname, '')
    if (!tags || !categories || !title || !description || !date) {
        throw new Error(`front matter is not correct in ${filePath}`)
    }
    tags && tags.forEach(tag => {
        if (mTags.filter(mTag => mTag === tag).length === 0) {
            mTags.push(tag)
        }
    })

    categories && categories.forEach(category => {
        if (
            mCategories.filter(mCategory => mCategory === category).length === 0
        ) {
            mCategories.push(category)
        }
    })

    posts.push({ tags, categories, title, description, url, id: uniqid(), image, date })
})

let data = JSON.stringify({ posts, mTags, mCategories })

fs.writeFile('./db.json', data, err => {
    if (err) throw err
})

function getReversedFilePaths(filePath) {
    //根据文件路径读取文件，返回文件列表
    let files = fs.readdirSync(filePath)
    files.forEach(filename => {
        let filedir = path.join(filePath, filename)
        let stats = fs.statSync(filedir)
        let isFile = stats.isFile()
        let isDir = stats.isDirectory()
        if (isFile) {
            filePaths.push(filedir)
        }
        if (isDir) {
            getReversedFilePaths(filedir)
        }
    })
}