"use client";
import {
  FC,
  useState,
} from 'react';

import { useQueryState } from 'nuqs';
import Select from 'react-select';

import { MapIndex } from '@/server/loadMapIndex';

import {
  FilterItem,
  parseFilterParam,
} from './params';

const FilterPair: FC<{
  filter: FilterItem;
}> = ({ filter }) => {
  return (
    <div className="text-xs font-mono">
      <span className="font-bold">{filter.key}</span> = {filter.value}
    </div>
  );
};

const DeleteButton: FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <button
      className="text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer hover:bg-red-50 hover:text-red-500"
      onClick={onClick}
    >
      x
    </button>
  );
};

const NewFilter: FC<{
  mapIndex: MapIndex;
  setFilter: (filter: FilterItem) => void;
  cancel: () => void;
}> = ({ mapIndex, setFilter, cancel }) => {
  const [state, setState] = useState<
    | {
        kind: "empty";
      }
    | {
        kind: "key";
        key: string;
      }
  >({
    kind: "empty",
  });

  if (state.kind === "empty") {
    return (
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Select
            autoFocus
            classNames={{
              control: () => "h-6",
            }}
            options={Object.keys(mapIndex).map((key) => ({
              label: key,
              value: key,
            }))}
            onChange={(v) => {
              if (!v?.value) {
                return;
              }
              setState({ kind: "key", key: v.value });
            }}
          />
        </div>
        <DeleteButton onClick={cancel} />
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="text-xs font-mono">{state.key}</div>
      <div className="flex-1">
        <Select
          autoFocus
          classNames={{
            control: () => "h-6",
          }}
          options={Object.keys(mapIndex[state.key]).map((key) => ({
            label: key,
            value: key,
          }))}
          onChange={(v) => {
            if (!v?.value) {
              return;
            }
            setFilter({ key: state.key, value: v.value });
          }}
        />
      </div>
      <DeleteButton onClick={cancel} />
    </div>
  );
};

/**
 * A component that allows filtering the map list.
 * This is a placeholder implementation that will be expanded later.
 */
export const InnerMapFilter: FC<{ mapIndex: MapIndex }> = ({ mapIndex }) => {
  const [filters, setFilters] = useQueryState(
    "filter",
    parseFilterParam.withOptions({ shallow: false })
  );
  const [newFilter, setNewFilter] = useState(false);

  return (
    <div>
      {filters?.map((filter, i) => {
        return (
          <div key={i} className="flex gap-2 items-center">
            <div className="flex-1">
              <FilterPair filter={filter} />
            </div>
            <DeleteButton
              onClick={() => {
                setFilters(filters.filter((_, j) => j !== i));
              }}
            />
          </div>
        );
      })}
      {newFilter ? (
        <NewFilter
          key={filters?.length ?? 0}
          mapIndex={mapIndex}
          setFilter={(v) => {
            setFilters([...(filters ?? []), v]);
            setNewFilter(false);
          }}
          cancel={() => {
            setNewFilter(false);
          }}
        />
      ) : (
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs cursor-pointer"
          onClick={() => {
            setNewFilter(true);
          }}
        >
          Add Filter
        </button>
      )}
    </div>
  );
};
