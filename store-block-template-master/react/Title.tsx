import React from 'react';
import { useCssHandles } from "vtex.css-handles";
import { useQuery } from 'react-apollo'
import getSettings from './graphql/getSettings.graphql'
import { FormattedMessage } from 'react-intl'

interface TitleProps {
  title: string;
}

const CSS_HANDLES = ['title'] as const;

const Title: StorefrontFunctionComponent<TitleProps> = ({ title }) => {

  const { data, loading } = useQuery(getSettings, { ssr: false })
  let resultParsed = null;
  if (data && !loading) {
    try {
      const result = JSON.parse(JSON.stringify(data?.publicSettingsForApp?.message))
      resultParsed = JSON.parse(result)
    } catch (error) {
      console.log("error", error);
    }
  }

  const handles = useCssHandles(CSS_HANDLES);
  const titleText = resultParsed?.titleCountdown || title || <FormattedMessage id="countdown.title" />;

  return (
    <div className={`${handles.title} t-heading-2 fw3 w-100 c-muted-1 db tc`}>
      {titleText}
    </div>
  )
}

Title.schema = {
  title: 'countdown.title',
  description: 'editor.countdown.description',
  type: 'object',
  properties: {
    title: {
      title: 'editor.countdown.title',
      type: 'string',
      default: null,
    },
  },
}

export default Title