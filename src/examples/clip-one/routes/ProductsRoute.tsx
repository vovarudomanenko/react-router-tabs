import { Tabs } from "../components/Tabs/Tabs.tsx";
import { TabbedNavigationMeta, TabModel } from "src/lib/tabs";

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { routeIds } from "../routes.tsx";
import { data as products } from "../data/products.json";

import { usePersistTabs } from "src/lib/tabs/persist.ts";
import { localStorageDriver } from "src/lib/storage/local-storage.ts";
import { validateTabs } from "src/lib/tabs";
import { useDataRouterContext } from "src/hooks/useDataRouterContext.tsx";
import {
  homeRoute,
  productDetailRoute,
  productsListRoute,
} from "../constants/routes.constants.ts";
import { useTabbedNavigation2 } from "src/lib/tabs/tabbed-navigation-2.tsx";
import { css } from "@emotion/react";
import { Table } from "src/examples/clip-one/components/Table/Table.tsx";

type DetailParams = { id: string };

const persistStoreKey = {
  name: "clip-one__product-tabs",
  version: "1.0",
};

export function ProductsRoute() {
  const navigate = useNavigate();
  const { router } = useDataRouterContext();
  const { getTabsFromStorage, persistTabs } =
    usePersistTabs<TabbedNavigationMeta>({
      storageKey: persistStoreKey,
      storage: localStorageDriver,
    });

  const defaultTabs: TabModel<TabbedNavigationMeta>[] = [
    {
      id: productsListRoute,
      title: "List",
      meta: {
        routeId: routeIds.product.list,
        path: productsListRoute,
      },
    },
  ];

  const [tabs, setTabs] = useState(() =>
    validateTabs(getTabsFromStorage() || defaultTabs, router.routes.slice()),
  );

  const [startPinnedTabs, onStartPinnedTabsChange] = useState([
    productsListRoute,
  ]);

  const [config] = useState(() => [
    {
      title: () => "All products",
      id: productsListRoute,
      routeId: routeIds.product.list,
    },
    {
      title: ({ params }: { params: DetailParams }) => {
        const product = products.find(
          (product) => String(product.id) === params.id,
        );
        return product!.title;
      },
      id: ({ params }: { params: DetailParams }) =>
        productDetailRoute.replace(":id", params.id),
      routeId: routeIds.product.detail,
    },
  ]);

  const { activeTabId, setActiveTabId } = useTabbedNavigation2({
    config,
    onCloseAllTabs: useCallback(() => {
      navigate(homeRoute);
    }, [navigate]),
    startPinnedTabs,
    tabs,
    onTabsChange: setTabs,
    resolveTabMeta: useCallback(() => ({}), []),
  });

  useEffect(() => {
    return persistTabs(tabs);
  }, [tabs, persistTabs]);

  return (
    <div css={layoutStyles}>
      <Tabs
        tabs={tabs}
        onTabsChange={setTabs}
        onStartPinnedTabsChange={onStartPinnedTabsChange}
        startPinnedTabs={startPinnedTabs}
        initialActiveTabId={activeTabId}
        initialTabs={tabs}
        initialStartPinnedTabs={startPinnedTabs}
        hasControlledActiveTabId
        activeTabId={activeTabId}
        onActiveTabIdChange={setActiveTabId}
      />
      <div css={tabContentStyles}>
        <Outlet />
      </div>
    </div>
  );
}

export function ProductListRoute() {
  const navigate = useNavigate();
  return (
    <div
      css={css`
        padding: 10px;
      `}
    >
      <Table
        onRowClick={(row) => {
          navigate(productDetailRoute.replace(":id", String(row.id)));
        }}
        columns={[
          {
            field: "id",
            name: "ID",
            width: 40,
          },
          {
            field: "title",
            name: "Title",
            width: 150,
          },
        ]}
        rows={products}
      />
    </div>
  );
}

const layoutStyles = css`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const tabContentStyles = css`
  flex-grow: 1;
  border: 1px solid var(--border-color);
`;

export function ProductDetailRoute() {
  const params = useParams();
  return <div>product ${params.id}</div>;
}
