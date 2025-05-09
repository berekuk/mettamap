"use client";
import {
  FC,
  useMemo,
} from 'react';

import clsx from 'clsx';
import yaml from 'js-yaml';
import { useQueryState } from 'nuqs';

import {
  FilterItem,
  parseFilterParam,
} from '@/app/params';
import { MapFile } from '@/server/types';

import { CopyToClipboardButton } from './CopyToClipboardButton';
import { MapViewer } from './MapViewer';

const FrontmatterViewer: FC<{ frontmatter: Record<string, unknown> }> = ({
  frontmatter,
}) => {
  const [filters, setFilters] = useQueryState(
    "filter",
    parseFilterParam.withOptions({ shallow: false })
  );

  // Function to check if a key-value pair is currently in the filters
  const isFiltered = (key: string, value: string) => {
    return (
      filters?.some((filter) => filter.key === key && filter.value === value) ||
      false
    );
  };

  // Function to handle clicking on a frontmatter line
  const handleFrontmatterClick = (key: string, value: string) => {
    const newFilter: FilterItem = { key, value };

    // Check if this filter already exists
    const filterExists =
      filters?.some((filter) => filter.key === key && filter.value === value) ||
      false;

    if (filterExists) {
      // Remove the filter if it already exists
      setFilters(
        filters?.filter(
          (filter) => !(filter.key === key && filter.value === value)
        ) || []
      );
    } else {
      // Add the new filter
      setFilters([...(filters || []), newFilter]);
    }
  };

  // Function to render a key-value pair as a clickable line
  const renderFrontmatterLine = (
    key: string,
    value: unknown,
    path: string = ""
  ) => {
    const fullKey = path ? `${path}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      return (
        <div key={fullKey} className="ml-4">
          <div className="font-bold">{key}:</div>
          {Object.entries(value).map(([k, v]) =>
            renderFrontmatterLine(k, v, fullKey)
          )}
        </div>
      );
    }

    const isActive = isFiltered(fullKey, String(value));

    const multiline = typeof value === "string" && value.includes("\n");

    return (
      <div
        key={fullKey}
        className={clsx(
          "cursor-pointer hover:bg-blue-100 px-1 py-0.5 rounded font-mono",
          isActive && "bg-blue-200"
        )}
        onClick={() => handleFrontmatterClick(fullKey, String(value))}
      >
        <span className="font-bold">{key}:</span> {multiline && "|"}
        <span className="whitespace-pre-wrap">
          {typeof value === "string" && value.includes("\n")
            ? "\n" + value
            : String(value)}
        </span>
      </div>
    );
  };

  return (
    <div className="text-xs border border-gray-200 rounded p-4 bg-gray-50">
      {Object.entries(frontmatter).map(([key, value]) =>
        renderFrontmatterLine(key, value)
      )}
    </div>
  );
};

export const ExtendedMapViewer: FC<{ map: MapFile }> = ({ map }) => {
  // Parse the frontmatter YAML
  const frontmatterData = useMemo(() => {
    try {
      return yaml.load(map.content.frontmatter) as Record<string, unknown>;
    } catch (error) {
      console.error("Error parsing frontmatter:", error);
      return {};
    }
  }, [map.content.frontmatter]);

  return (
    <div className="grid grid-cols-[400px_1fr_250px] gap-8">
      <div className="max-h-[80vh] overflow-auto">
        <FrontmatterViewer frontmatter={frontmatterData} />
      </div>
      <div className="flex flex-col items-center justify-start overflow-auto">
        <div className="max-w-full">
          <MapViewer data={map.content.data} />
        </div>
      </div>
      <CopyToClipboardButton text={map.content.data}>
        Copy Map Data to Clipboard
      </CopyToClipboardButton>
    </div>
  );
};
