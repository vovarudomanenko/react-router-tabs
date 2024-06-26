import { useRef } from "react";
import { noop } from "src/utils/noop.ts";
import { Tab } from "src/examples/basic/components/Tabs/Tab.tsx";
import { TabsApi, TabsProps, useTabs } from "src/lib/tabs/useTabs.tsx";
import { css } from "@emotion/react";

export function Tabs(props: TabsProps) {
  const { onActiveTabIdChange = noop, apiRef: apiRefProp } = props;
  const localApiRef = useRef<TabsApi>({} as TabsApi);
  const apiRef = localApiRef || apiRefProp;

  useTabs(apiRef, props);

  const { tabs, activeTabId, startPinnedTabs } = apiRef.current.getState();

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div css={rootStyles}>
      {tabs.map((tab) => (
        <Tab
          onActiveTabIdChange={onActiveTabIdChange}
          onClose={apiRef.current.closeTab}
          isPinned={startPinnedTabs.includes(tab.id)}
          isActive={activeTab?.id === tab.id}
          tab={tab}
          key={tab.id}
        />
      ))}
    </div>
  );
}

const rootStyles = css`
  display: flex;
  border-bottom: 1px solid #eee;
  height: 40px;
`;
