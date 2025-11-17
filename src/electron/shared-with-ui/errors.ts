export const errors = {
  unknownError: 'Unknown error occured.',
  cantScrap: 'Could not scrap any companies.',
  cantAddPayloadMsg: 'Couldn\'t add payload message.',
  companiesListCacheEmpty: 'Companies list cache file is empty, trying to scrap...',
  usingStaleCompaniesList: 'Unable to scrap fresh companies, using stale data from cache.'
} as const;