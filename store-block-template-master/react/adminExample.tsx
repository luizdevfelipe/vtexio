import React, { FC } from 'react'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

const AdminExample: FC = () => {
  return (
    <Layout fullWidth pageHeader={<PageHeader title="Admin Example" />}>
      <PageBlock>
        <h1>Hello, World!</h1>
      </PageBlock>
    </Layout>
  )
}

export default AdminExample