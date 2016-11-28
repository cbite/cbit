from enum import Enum


class FilterMode(Enum):
    AllButThese = 0
    OnlyThese = 1


class SampleFilter(object):
    def __init__(self, mode, detail):
        """
        Python wrapper object for the corresponding SampleFilter object:

        export interface SampleFilter {
          mode: FilterMode,
          detail: {
            // If mode is AllButThese, include every value category except those listed below.
            // Otherwise, if mode is OnlyThese, only include the values below.
            [valueName: string]: boolean
          }
        }
        """
        self.mode = mode
        self.detail = detail

    @staticmethod
    def from_json(jsObj):
        return SampleFilter(mode=FilterMode(jsObj["mode"]), detail=jsObj["detail"])

    def to_json(self):
        return {
            "mode": self.mode.value,
            "detail": self.detail
        }


class FiltersState(object):
    def __init__(self, searchText, includeControls, sampleFilters):
        """
        Python wrapper object for the corresponding JavaScript FiltersState object:

        export interface FiltersState {
          searchText: string,
          includeControls: boolean,
          sampleFilters: SampleFilters
        }

        export interface SampleFilters {
          [category: string]: SampleFilter
        }
        """
        self.searchText = searchText
        self.includeControls = includeControls
        self.sampleFilters = sampleFilters

    @staticmethod
    def from_json(jsObj):
        return FiltersState(searchText=jsObj["searchText"],
                            includeControls=jsObj["includeControls"],
                            sampleFilters={
                                category: SampleFilter.from_json(jsFilter)
                                for category, jsFilter in jsObj["sampleFilters"].iteritems()
                            })

    def to_json(self):
        return {
            "searchText": self.searchText,
            "includeControls": self.includeControls,
            "sampleFilters": {
                category: sampleFilter.to_json()
                for category, sampleFilter in self.sampleFilters.iteritems()
            }
        }