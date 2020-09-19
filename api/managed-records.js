import fetch from '../util/fetch-fill'
import URI from 'urijs'

// /records endpoint
window.path = 'http://localhost:3000/records'

// Your retrieve function plus any additional functions go here ...

const retrieve = options => {
	options = options || {}
	const limit = 10
	const page = options.page || 1
	const primaryColors = ['red', 'blue', 'yellow']

	// Construct the URI based on the options provided
	const uri = URI(window.path)
		.addSearch('limit', limit + 1)
		.addSearch('offset', (page - 1) * limit)
	if (options.colors && options.colors.length > 0) {
		uri.addSearch('color[]', options.colors)
	}

	// API Call to the URI
	async function apiCall(uri) {
		const query = await fetch(uri)
		// Fail-fast if query doesn't succeed
		if (!query.ok) {
			// Pop-culture reference, just for fun
			// (Just so you know, I wouldn't do this in a real, client-facing project)
			console.error(`☠ FLAGRANT SYSTEM ERROR (${query.status}) ☠`)
		}
		const response = await query.json()

		// Determine if it is the last page
		const isLastPage = response.length <= limit
		if (!isLastPage) {
			response.splice(limit, 1)
		}

		// Add property if color is a primary color
		const alteredResponse = response.map(item => {
			item.isPrimary = primaryColors.indexOf(item.color) != -1
			return item
		})

		// Create the values for `ids`, `open`, `closedPrimaryCount`, `previousPage`, and `nextPage`
		const ids = alteredResponse.map(item => item.id)
		const open = alteredResponse.filter(item => item.disposition == 'open')
		const closedPrimaryCount = alteredResponse.filter(
			item => item.disposition == 'closed' && item.isPrimary === true
		).length
		const previousPage = page == 1 ? null : page - 1
		const nextPage = isLastPage ? null : page + 1

		// Return the transformed response
		return { ids, open, closedPrimaryCount, previousPage, nextPage }
	}

	return apiCall(uri).catch(error => {
		// One more pop-culture reference for good measure
		// (Again, this is for your and my amusement, not something I'd really put in production code)
		console.log(`⚠ What'd you do? ⚠\n${error}`)
	})
}

export default retrieve
