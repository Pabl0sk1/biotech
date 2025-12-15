// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Arquitectura',
      items: [
        'arc/backend',
        'arc/frontend',
        'arc/database',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/position',
        'api/employee',
        'api/module',
        'api/permission',
        'api/branch',
        'api/schedule',
        'api/role',
        'api/shift',
        'api/user',
        'api/seller',
      ],
    }
  ],
};

export default sidebars;
