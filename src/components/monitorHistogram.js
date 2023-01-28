import React from 'react'
import config from '../../config.yaml'
import MonitorDayAverage from './monitorDayAverage'

export default function MonitorHistogram({ monitorId, kvMonitor }) {
  // create date and set date - daysInHistogram for the first day of the histogram
  let dateForAverages = new Date()
  dateForAverages.setDate(
    dateForAverages.getDate() - config.settings.daysInHistogram,
  )
  let dateForHistogram = new Date()
  dateForHistogram.setDate(
    dateForHistogram.getDate() - config.settings.daysInHistogram,
  )

  let content = null

  if (typeof window !== 'undefined') {
    let maxAvg = 0
    let histogramAverages = {}

    Array.from(Array(config.settings.daysInHistogram).keys()).forEach((_) => {
      dateForAverages.setDate(dateForAverages.getDate() + 1)
      const dayInHistogram = dateForAverages.toISOString().split('T')[0]
      let sum = 0

      if (
        kvMonitor.checks.hasOwnProperty(dayInHistogram) &&
        kvMonitor.checks[dayInHistogram].hasOwnProperty('res')
      ) {
        let totalResponses = 0
        Object.keys(kvMonitor.checks[dayInHistogram].res).map((locationKey) => {
          const currentLocationAvg =
            kvMonitor.checks[dayInHistogram].res[locationKey].a
          if (currentLocationAvg > maxAvg) {
            maxAvg = currentLocationAvg
          }
          sum += currentLocationAvg
          totalResponses += 1
        })

        histogramAverages[dayInHistogram] =
          totalResponses > 0 ? Math.round(sum / totalResponses) : undefined
      }
    })

    content = Array.from(Array(config.settings.daysInHistogram).keys()).map(
      (key) => {
        dateForHistogram.setDate(dateForHistogram.getDate() + 1)
        const dayInHistogram = dateForHistogram.toISOString().split('T')[0]

        let bg = ''
        let dayInHistogramLabel = config.settings.dayInHistogramNoData
        let height = 0

        // filter all dates before first check, then check the rest
        if (kvMonitor && kvMonitor.firstCheck <= dayInHistogram) {
          if (
            kvMonitor.checks.hasOwnProperty(dayInHistogram) &&
            kvMonitor.checks[dayInHistogram].fails > 0
          ) {
            bg = 'yellow'
            dayInHistogramLabel = `${kvMonitor.checks[dayInHistogram].fails} ${config.settings.dayInHistogramNotOperational}`
            height = 100
          } else {
            bg = 'green'
            dayInHistogramLabel = config.settings.dayInHistogramOperational

            if (
              maxAvg > 0 &&
              histogramAverages.hasOwnProperty(dayInHistogram)
            ) {
              height = Math.round(
                (histogramAverages[dayInHistogram] / maxAvg) * 100,
              )
            }
          }
        }

        return (
          <div key={key} className="hitbox tooltip">
            <div className="bar-container">
              <div className={`${bg} bar`} style={{ height: `${height}%` }} />
            </div>
            <div className="content text-center py-1 px-2 mt-2 left-1/2 -ml-20 w-40 text-xs">
              {dayInHistogram}
              <br />
              <span className="font-semibold text-sm">
                {dayInHistogramLabel}
              </span>
              {kvMonitor &&
                kvMonitor.checks.hasOwnProperty(dayInHistogram) &&
                Object.keys(kvMonitor.checks[dayInHistogram].res).map((key) => {
                  return (
                    <MonitorDayAverage
                      location={key}
                      avg={kvMonitor.checks[dayInHistogram].res[key].a}
                    />
                  )
                })}
            </div>
          </div>
        )
      },
    )
  }

  return (
    <div
      key={`${monitorId}-histogram`}
      className="flex flex-row items-center histogram"
    >
      {content}
    </div>
  )
}
