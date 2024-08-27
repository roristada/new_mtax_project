import React from 'react'

const Blog_detail = ({ params }: { params: { id: string } }) => {
  return (
    <div>test {params.id}</div>
  )
}

export default Blog_detail