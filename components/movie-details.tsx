                    <EditableMoviePlot
                      initialPlot={plot}
                      movieTitle={movie.title}
                      movieMeta={{
                        id: movie.id,
                        releaseDate: movie.release_date,
                        directors: directors?.map(d => d.name) || [],
                        cast: cast?.slice(0, 5).map(a => a.name) || [],
                        genres: movie.genres?.map(g => g.name) || [],
                        runtime: movie.runtime,
                        voteAverage: movie.vote_average
                      }}
                      onSave={async (newPlot) => {
                        try {
                          // Invia la richiesta all'API per salvare la trama
                          const response = await fetch('/api/salva-contenuto', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              slug: movie.slug || `${movie.title.toLowerCase().replace(/\s+/g, '-')}-${movie.id}`,
                              contentType: 'plot',
                              content: newPlot,
                              pageType: 'movie'
                            })
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Errore durante il salvataggio');
                          }

                          console.log("Trama film salvata con successo:", movie.title);
                          return Promise.resolve();
                        } catch (error) {
                          console.error("Errore durante il salvataggio:", error);
                          return Promise.reject(error);
                        }
                      }} 