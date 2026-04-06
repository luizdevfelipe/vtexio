import React, { FC } from 'react'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'
import helloworld from './graphql/helloworld.graphql'

const AdminExample: FC = () => {
  const { data, loading } = useQuery(helloworld)
  return (
    <Layout fullWidth pageHeader={<PageHeader title="Admin Example" />}>
      <PageBlock>
        <h1>Hello, World!</h1>
        <p>{ loading ? 'Loading...' : data?.helloworld}</p>
      </PageBlock>
    </Layout>
  )
}

export default AdminExample