const lower = (text) => text.toLowerCase();
const upper = (text) => text.toUpperCase();
const title = (text) => text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase();
module.exports = function (page) {
    return [
        {
            name: `src/pages/${lower(page)}/index.js`,
            content: `import React from 'react';
import styles from './style.css';

export class ${title(page)} extends React.Component {
    render() {
        return (
            <div className={styles.${lower(page)}}>
                Hello,${upper(page)}
            </div>
        );
    }
}`
        },
        {
            name: `src/pages/${lower(page)}/style.css`,
            content: `.${lower(page)}{
    background: #888;
}`
        },
        {
            name: `src/pages/index.js`,
            type: 'append',
            content: `export * from './${lower(page)}';\n`
        }
    ]
}