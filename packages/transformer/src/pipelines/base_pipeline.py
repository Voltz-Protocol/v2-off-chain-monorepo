import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions
from apache_beam.transforms import PTransform

def run_pipeline(pipeline_options: PipelineOptions, readTransform: PTransform, writeTransform: PTransform, transformation: PTransform=None):
    with beam.Pipeline(options=pipeline_options) as pipeline:
        data = pipeline | 'Reading' >> readTransform

        if transformation:
            data = data | 'Apply Transformation' >> transformation

        data = data | 'Writing' >> writeTransform
