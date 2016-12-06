from enum import Enum

class FilterMode(Enum): ...

class SampleFilter(object):
    def __init__(self, mode: FilterMode, detail: dict[str, bool]): ...

    @staticmethod
    def from_json(cls, jsObj: dict) -> 'SampleFilter': ...

    def to_json(self) -> dict: ...

class FiltersState(object):
    def __init__(self, searchText: str, includeControls: bool, sampleFilters: dict[str, SampleFilter]): ...

    @staticmethod
    def from_json(cls, jsObj: dict) -> 'FiltersState': ...

    def to_json(self) -> dict: ...